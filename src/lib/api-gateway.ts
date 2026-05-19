import db from './db';
import type { DBApiKey, DBUser } from './db';
import { verifyToken, getTokenFromCookie, decrypt, hashApiKey } from './auth';
import { checkRateLimit, type RateLimitResult } from './rate-limiter';
import { deductBalance, deductCreditsOrBalance, calculateCost, logUsage, getEffectiveMultiplier, getActiveSubscription, dispatchWebhook } from './billing-engine';
import { selectChannel, reportChannelFailure, reportChannelSuccess } from './channel-manager';

export interface GatewayRequest {
  model: string;
  messages?: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>;
  prompt?: string;
  input?: string | string[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  n?: number;
  size?: string;
  // Tool / function calling
  tools?: Array<{ type: string; function: { name: string; description?: string; parameters?: unknown } }>;
  tool_choice?: string | { type: string; function?: { name: string } };
  functions?: Array<{ name: string; description?: string; parameters?: unknown }>;
  function_call?: string | { name: string };
  // Other common OpenAI-compatible params
  response_format?: { type: string };
  stop?: string | string[];
  seed?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  [key: string]: unknown;
}

export function setRateLimitHeaders(headers: Headers, rateLimit?: { limit: number; remaining: number; resetAt: number }) {
  if (!rateLimit) return;
  headers.set('X-RateLimit-Limit', String(rateLimit.limit));
  headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetAt / 1000)));
}

export function setDeprecationHeader(headers: Headers, warning?: string) {
  if (warning) {
    headers.set('X-Deprecation-Warning', warning);
    headers.set('Sunset', 'Sat, 01 Jan 2027 00:00:00 GMT');
  }
}

export interface GatewayResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  statusCode?: number;
  rateLimit?: { limit: number; remaining: number; resetAt: number };
  deprecationWarning?: string;
  headers?: Record<string, string>;
}

// Validate API Key from Authorization header
export function validateApiKey(authHeader: string | null): { valid: boolean; apiKey?: DBApiKey; user?: DBUser; error?: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' };
  }

  const keyValue = authHeader.slice(7).trim();
  if (!keyValue) {
    return { valid: false, error: 'Empty API key' };
  }

  // Try hash-based lookup first
  const keyHash = hashApiKey(keyValue);
  let apiKey = db.prepare('SELECT * FROM api_keys WHERE key_hash = ? AND enabled = 1').get(keyHash) as DBApiKey | undefined;

  // Fallback: plaintext match for legacy keys (lazy migration)
  if (!apiKey) {
    apiKey = db.prepare('SELECT * FROM api_keys WHERE key_value = ? AND enabled = 1').get(keyValue) as DBApiKey | undefined;
    if (apiKey) {
      // Migrate: store hash, mask the plaintext value
      try {
        db.prepare('UPDATE api_keys SET key_hash = ?, key_value = ? WHERE id = ?').run(keyHash, keyValue.slice(0, 10) + '****', apiKey.id);
      } catch { /* key_hash column may not exist yet */ }
    }
  }

  if (!apiKey) {
    return { valid: false, error: 'Invalid or disabled API key' };
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(apiKey.user_id) as DBUser | undefined;
  if (!user) {
    return { valid: false, error: 'User not found' };
  }

  // Update last used timestamp
  db.prepare('UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP, total_calls = total_calls + 1 WHERE id = ?').run(apiKey.id);

  return { valid: true, apiKey, user };
}

// Validate user from cookie (for dashboard API routes)
export function validateUserFromCookie(cookieHeader: string | null): { valid: boolean; user?: DBUser; error?: string } {
  const token = getTokenFromCookie(cookieHeader);
  if (!token) return { valid: false, error: 'Not authenticated' };

  const payload = verifyToken(token);
  if (!payload) return { valid: false, error: 'Invalid or expired token' };

  const user = db.prepare('SELECT * FROM users WHERE id = ? AND enabled = 1').get(payload.userId) as DBUser | undefined;
  if (!user) return { valid: false, error: 'User not found or account disabled' };

  return { valid: true, user };
}

// Process an API request through the gateway (with failover retry)
export async function processGatewayRequest(
  req: GatewayRequest,
  authHeader: string | null,
  endpoint: 'chat/completions' | 'completions' | 'images/generations' | 'embeddings'
): Promise<GatewayResponse> {
  // 1. Validate API key
  const auth = validateApiKey(authHeader);
  if (!auth.valid || !auth.apiKey || !auth.user) {
    return { success: false, error: auth.error || 'Unauthorized', statusCode: 401 };
  }

  const { apiKey, user } = auth;

  // 1.5. Check model permissions
  try {
    const perms = JSON.parse(apiKey.permissions || '{"models":["*"]}');
    if (perms.models && !perms.models.includes('*') && !perms.models.includes(req.model)) {
      return { success: false, error: `API key does not have permission to use model: ${req.model}`, statusCode: 403 };
    }
  } catch { /* invalid JSON — allow all */ }

  // 2. Check rate limit
  const rateLimit = checkRateLimit(apiKey.id, apiKey.rate_limit);
  const rateLimitInfo = { limit: rateLimit.limit, remaining: rateLimit.remaining, resetAt: rateLimit.resetAt };
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetAt).toISOString()}`,
      statusCode: 429,
      rateLimit: rateLimitInfo,
    };
  }

  // 3. Check balance (allow through if user has subscription credits)
  const subInfo = getActiveSubscription(user.id);
  if (user.balance <= 0 && (!subInfo || subInfo.subscription.credits_remaining <= 0)) {
    return { success: false, error: 'Insufficient balance. Please recharge.', statusCode: 402, rateLimit: rateLimitInfo };
  }
  // Fire balance.low webhook if balance is below 1 USD
  if (user.balance > 0 && user.balance < 1.0) {
    dispatchWebhook('balance.low', { user_id: user.id, balance: user.balance });
  }

  // 3.5. Resolve model alias and check deprecation
  let resolvedModel = req.model;
  let deprecationWarning: string | undefined;
  try {
    const modelInfo = db.prepare('SELECT alias_for, deprecated, deprecated_message FROM model_rates WHERE model_name = ? AND enabled = 1').get(req.model) as { alias_for: string | null; deprecated: number; deprecated_message: string | null } | undefined;
    if (modelInfo?.alias_for) {
      resolvedModel = modelInfo.alias_for;
    }
    if (modelInfo?.deprecated) {
      deprecationWarning = modelInfo.deprecated_message || `Model "${req.model}" is deprecated and will be removed in a future version.`;
    }
  } catch { /* ignore */ }

  // 4. Select channel with failover retry
  const MAX_RETRIES = 3;
  let lastError: GatewayResponse | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const selection = selectChannel(resolvedModel);
    if (!selection) {
      if (!lastError) {
        return { success: false, error: `No available channel for model: ${req.model}`, statusCode: 503, rateLimit: rateLimitInfo };
      }
      break;
    }

    const { channel, model: actualModel } = selection;
    const result = await executeChannelRequest(req, apiKey.id, user.id, channel, actualModel, endpoint);
    result.rateLimit = rateLimitInfo;
    if (deprecationWarning) result.deprecationWarning = deprecationWarning;

    if (result.success) return result;

    lastError = result;

    if (result.statusCode && result.statusCode < 500) return result;
  }

  return lastError || {
    success: false,
    error: 'All upstream channels failed. Please retry after a few seconds.',
    statusCode: 503,
    rateLimit: rateLimitInfo,
    headers: { 'Retry-After': '5' },
  };
}

// Execute a request against a single channel
async function executeChannelRequest(
  req: GatewayRequest,
  apiKeyId: number,
  userId: number,
  channel: { id: number; base_url: string | null; type: string; api_key_encrypted: string },
  actualModel: string,
  endpoint: string,
): Promise<GatewayResponse> {
  const startTime = Date.now();

  try {
    const upstreamUrl = buildUpstreamUrl(channel.base_url || '', endpoint, channel.type);
    const upstreamBody = buildUpstreamRequest({ ...req, model: actualModel }, channel.type);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const decryptedKey = decrypt(channel.api_key_encrypted);
    if (channel.type === 'anthropic') {
      headers['x-api-key'] = decryptedKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${decryptedKey}`;
    }

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(upstreamBody),
      signal: AbortSignal.timeout(180_000), // 3 min timeout for LLM requests
    });

    const latencyMs = Date.now() - startTime;

    if (!upstreamRes.ok) {
      const errorText = await upstreamRes.text();
      reportChannelFailure(channel.id, errorText);

      logUsage({
        userId, apiKeyId,
        channelId: channel.id, model: req.model,
        tokensIn: 0, tokensOut: 0, cost: 0, latencyMs,
        success: false, errorMessage: errorText,
      });

      const safeStatus = upstreamRes.status >= 500 ? 502 : upstreamRes.status;
      // Don't leak internal upstream error details to clients
      const safeError = upstreamRes.status >= 500
        ? `Upstream service error (${upstreamRes.status})`
        : `Upstream request failed (${upstreamRes.status})`;
      return { success: false, error: safeError, statusCode: safeStatus };
    }

    if (req.stream) {
      return {
        success: true,
        data: {
          stream: true, response: upstreamRes,
          channelId: channel.id, userId, apiKeyId,
          model: req.model, startTime,
        },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = await upstreamRes.json();
    } catch {
      const errorText = await upstreamRes.text().catch(() => 'Invalid response');
      reportChannelFailure(channel.id, `Non-JSON response: ${errorText.slice(0, 200)}`);
      return { success: false, error: 'Upstream returned invalid response', statusCode: 502 };
    }
    reportChannelSuccess(channel.id);

    const tokensIn = data.usage?.prompt_tokens || data.usage?.input_tokens || estimateTokens(JSON.stringify(req.messages || req.prompt || ''));
    const tokensOut = data.usage?.completion_tokens || data.usage?.output_tokens || estimateTokens(JSON.stringify(data.choices?.[0]?.message?.content || ''));
    const tokensInCache = data.usage?.prompt_tokens_details?.cached_tokens || data.usage?.cache_read_input_tokens || 0;
    const { multiplier } = getEffectiveMultiplier(req.model);
    const baseCost = calculateCost(req.model, tokensIn, tokensOut, tokensInCache);
    const cost = baseCost * multiplier;

    const deductResult = deductCreditsOrBalance(userId, req.model, cost, `API call: ${req.model}`, tokensIn, tokensOut, tokensInCache);
    if (!deductResult.success) {
      console.error('Failed to deduct:', deductResult.error);
    }

    logUsage({
      userId, apiKeyId,
      channelId: channel.id, model: req.model,
      tokensIn, tokensOut, tokensInCache,
      cost: deductResult.source === 'credits' ? 0 : cost,
      creditsUsed: deductResult.source === 'credits' ? (tokensIn + tokensOut) : 0,
      deductionSource: deductResult.source,
      latencyMs, success: true, multiplier,
    });

    return { success: true, data };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    reportChannelFailure(channel.id, String(error));

    logUsage({
      userId, apiKeyId,
      channelId: channel.id, model: req.model,
      tokensIn: 0, tokensOut: 0, cost: 0, latencyMs,
      success: false, errorMessage: String(error),
    });

    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Upstream request timed out (180s)', statusCode: 504 };
    }
    return { success: false, error: 'Gateway error: upstream request failed', statusCode: 502 };
  }
}

// Build upstream URL based on provider type
function buildUpstreamUrl(baseUrl: string, endpoint: string, providerType: string): string {
  const base = baseUrl.replace(/\/$/, '');

  // Anthropic uses /v1/messages instead of /v1/chat/completions
  if (providerType === 'anthropic' && endpoint === 'chat/completions') {
    return `${base}/v1/messages`;
  }

  return `${base}/v1/${endpoint}`;
}

// Build upstream request body based on provider type
function buildUpstreamRequest(req: GatewayRequest, providerType: string): unknown {
  if (providerType === 'anthropic') {
    // Convert OpenAI-format tools back to Anthropic format for Anthropic upstream
    const anthropicTools = Array.isArray(req.tools) ? req.tools.map((tool) => {
      // Already in Anthropic format (no type/function wrapper)
      if (!('type' in tool) || (tool as { type?: string }).type !== 'function') {
        return tool;
      }
      // Convert from OpenAI format to Anthropic format
      const fn = (tool as { function?: { name?: string; description?: string; parameters?: unknown } }).function;
      return {
        name: fn?.name || (tool as { name?: string }).name,
        description: fn?.description || (tool as { description?: string }).description,
        input_schema: fn?.parameters || { type: 'object', properties: {} },
      };
    }) : undefined;

    // Convert tool_choice from OpenAI format to Anthropic format
    let anthropicToolChoice: unknown = req.tool_choice;
    if (typeof anthropicToolChoice === 'string') {
      if (anthropicToolChoice === 'auto') anthropicToolChoice = { type: 'auto' };
      else if (anthropicToolChoice === 'required') anthropicToolChoice = { type: 'any' };
    } else if (anthropicToolChoice && typeof anthropicToolChoice === 'object' && (anthropicToolChoice as Record<string, unknown>).type === 'function') {
      const fn = (anthropicToolChoice as Record<string, unknown>).function as { name?: string } | undefined;
      anthropicToolChoice = { type: 'tool', name: fn?.name };
    }

    const anthropicBody: Record<string, unknown> = {
      model: req.model,
      messages: req.messages,
      max_tokens: req.max_tokens || 4096,
      stream: req.stream || false,
      tools: anthropicTools,
      tool_choice: anthropicToolChoice,
    };
    // Pass through Anthropic-specific fields if present
    const reqObj = req as Record<string, unknown>;
    if (reqObj.system) anthropicBody.system = reqObj.system;
    if (reqObj.thinking) anthropicBody.thinking = reqObj.thinking;
    if (req.temperature != null) anthropicBody.temperature = req.temperature;
    if (req.top_p != null) anthropicBody.top_p = req.top_p;
    if (req.stop) anthropicBody.stop_sequences = req.stop;

    // Clean "[undefined]" string values
    for (const key of Object.keys(anthropicBody)) {
      if (anthropicBody[key] === '[undefined]') delete anthropicBody[key];
    }

    return anthropicBody;
  }

  // OpenAI-compatible (default): pass through client params, strip Anthropic-only fields
  const { system: _system, thinking: _thinking, ...rest } = req as Record<string, unknown>;
  const body: Record<string, unknown> = { ...rest };

  // Ensure stream_options is set for streaming usage data
  if (req.stream) {
    body.stream_options = { include_usage: true };
  }

  // Clean up "[undefined]" string values sent by some clients
  for (const key of Object.keys(body)) {
    if (body[key] === '[undefined]') {
      delete body[key];
    }
  }

  return body;
}

// Simple token estimation (4 chars ~= 1 token for English, 2 chars ~= 1 for Chinese)
export function estimateTokens(text: string): number {
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 2 + otherChars / 4);
}
