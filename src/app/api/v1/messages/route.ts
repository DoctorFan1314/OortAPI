import { NextRequest, NextResponse } from 'next/server';
import { processGatewayRequest, estimateTokens, setRateLimitHeaders } from '@/lib/api-gateway';
import { deductCreditsOrBalance, calculateCost, logUsage, getEffectiveMultiplier } from '@/lib/billing-engine';
import { checkPromptCache } from '@/lib/prompt-cache';

export const dynamic = 'force-dynamic';

// Anthropic-compatible downstream endpoint
// Accepts: x-api-key header, Anthropic request body format
// Returns: Anthropic response format
export async function POST(request: NextRequest) {
  try {
    // Authenticate with x-api-key (Anthropic style) or Authorization header
    const apiKey = request.headers.get('x-api-key');
    const authHeader = apiKey ? `Bearer ${apiKey}` : request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { type: 'error', error: { type: 'authentication_error', message: 'Missing API key' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.model) {
      return NextResponse.json(
        { type: 'error', error: { type: 'invalid_request_error', message: 'model is required' } },
        { status: 400 }
      );
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { type: 'error', error: { type: 'invalid_request_error', message: 'messages array is required' } },
        { status: 400 }
      );
    }

    // Convert Anthropic tools format to OpenAI format for the gateway
    const convertedTools = Array.isArray(body.tools) ? body.tools.map((tool: { name: string; description?: string; input_schema?: Record<string, unknown> }) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
      },
    })) : undefined;

    // Convert Anthropic format to internal gateway format
    const gatewayBody = {
      model: body.model,
      messages: body.messages.map((m: { role: string; content: string | Array<{ type: string; text?: string; tool_use_id?: string; content?: string | Array<{ type: string; text?: string }> }> }) => {
        if (typeof m.content === 'string') {
          return { role: m.role, content: m.content };
        }
        // Map Anthropic content blocks to OpenAI message format
        if (m.role === 'assistant') {
          // Check for tool_use blocks
          const textParts: string[] = [];
          const toolCalls: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }> = [];
          for (const block of m.content) {
            if (block.type === 'text' && block.text) {
              textParts.push(block.text);
            }
            if (block.type === 'tool_use') {
              toolCalls.push({
                id: (block as { id?: string }).id || '',
                type: 'function',
                function: {
                  name: (block as { name?: string }).name || '',
                  arguments: JSON.stringify((block as { input?: unknown }).input || {}),
                },
              });
            }
          }
          const msg: Record<string, unknown> = { role: 'assistant', content: textParts.join('') || null };
          if (toolCalls.length > 0) msg.tool_calls = toolCalls;
          return msg;
        }
        if (m.role === 'user') {
          // Check for tool_result blocks
          const toolResults: Array<{ role: 'tool'; tool_call_id: string; content: string }> = [];
          const textParts: string[] = [];
          for (const block of m.content) {
            if (block.type === 'tool_result') {
              const resultContent = typeof block.content === 'string' ? block.content
                : Array.isArray(block.content) ? block.content.map((c) => (c as { text?: string }).text || '').join('')
                : '';
              toolResults.push({
                role: 'tool',
                tool_call_id: block.tool_use_id || '',
                content: resultContent,
              });
            } else if (block.type === 'text' && block.text) {
              textParts.push(block.text);
            }
          }
          if (toolResults.length > 0) {
            // Return tool results as separate messages (OpenAI format)
            if (textParts.length > 0) {
              return [{ role: 'user', content: textParts.join('') }, ...toolResults];
            }
            return toolResults;
          }
          return { role: 'user', content: textParts.join('') };
        }
        // system or other roles
        return {
          role: m.role,
          content: typeof m.content === 'string' ? m.content
            : m.content.map((c) => (c as { text?: string }).text || '').join(''),
        };
      }).flat(),
      max_tokens: body.max_tokens,
      temperature: body.temperature,
      top_p: body.top_p,
      stream: body.stream || false,
      tools: convertedTools,
      // Convert Anthropic tool_choice to OpenAI format
      tool_choice: body.tool_choice ? (() => {
        const tc = body.tool_choice;
        if (tc.type === 'auto') return 'auto';
        if (tc.type === 'any') return 'required';
        if (tc.type === 'tool') return { type: 'function', function: { name: tc.name } };
        return undefined;
      })() : undefined,
    };

    // Handle streaming
    if (body.stream) {
      const result = await processGatewayRequest(gatewayBody, authHeader, 'chat/completions');
      if (!result.success) {
        const res = NextResponse.json(
          { type: 'error', error: { type: 'api_error', message: result.error } },
          { status: result.statusCode || 500 }
        );
        setRateLimitHeaders(res.headers, result.rateLimit);
        if (result.headers) {
          for (const [k, v] of Object.entries(result.headers)) res.headers.set(k, v);
        }
        return res;
      }

      const streamData = result.data as {
        response: Response;
        channelId: number;
        userId: number;
        apiKeyId: number;
        model: string;
        startTime: number;
      };

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      let buffer = '';
      let tokensIn = 0;
      let tokensOut = 0;
      let tokensInCache = 0;
      let completionText = '';
      let logged = false;
      let firstChunkTime = 0;
      let chunkCount = 0;
      const msgId = `msg_${Date.now().toString(36)}`;

      function doLogUsage() {
        if (logged) return;
        logged = true;

        if (tokensIn === 0) tokensIn = estimateTokens(JSON.stringify(body.messages));
        if (tokensOut === 0 && completionText) tokensOut = estimateTokens(completionText);

        // If upstream didn't report cache stats, use local prompt cache
        if (tokensInCache === 0 && tokensIn > 0) {
          tokensInCache = checkPromptCache(streamData.userId, streamData.model, body.messages, tokensIn).cacheHit;
        }

        const latencyMs = Date.now() - streamData.startTime;
        const ttftMs = firstChunkTime > 0 ? firstChunkTime - streamData.startTime : 0;
        const itlMs = chunkCount > 1 ? (Date.now() - firstChunkTime) / (chunkCount - 1) : 0;
        const { multiplier } = getEffectiveMultiplier(streamData.model);
        const baseCost = calculateCost(streamData.model, tokensIn, tokensOut, tokensInCache);
        const cost = baseCost * multiplier;

        let deductResult: { source: string } | undefined;
        if (cost > 0) {
          deductResult = deductCreditsOrBalance(streamData.userId, streamData.model, cost, `API call: ${streamData.model}`, tokensIn, tokensOut, tokensInCache);
        }

        logUsage({
          userId: streamData.userId,
          apiKeyId: streamData.apiKeyId,
          channelId: streamData.channelId,
          model: streamData.model,
          tokensIn, tokensOut, tokensInCache,
          cost: deductResult?.source === 'credits' ? 0 : cost,
          creditsUsed: deductResult?.source === 'credits' ? (tokensIn + tokensOut) : 0,
          deductionSource: deductResult?.source || 'balance',
          latencyMs, ttftMs, itlMs, success: true, multiplier,
        });
      }

      // The upstream may return Anthropic SSE (from anthropic channels) or OpenAI SSE (from openai channels).
      // We normalize to Anthropic SSE format for the downstream client.
      const isUpstreamAnthropic = streamData.response.headers.get('content-type')?.includes('text/event-stream');

      let sentMessageStart = false;
      let contentBlockIndex = 0;
      let currentText = '';
      let reasoningText = '';
      let sentThinkingBlock = false;
      let toolUseBlocks: Array<{ id: string; name: string; input: string }> = [];
      let sentToolBlocks = false;
      let lastEventLine = '';

      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          buffer += text;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ') && !line.startsWith('event: ')) continue;

            // Track Anthropic event lines (forward later with data)
            if (line.startsWith('event: ')) {
              lastEventLine = line.slice(7).trim();
              continue;
            }

            const data = line.slice(6).trim();
            if (!data || data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // Detect Anthropic format (has 'type' field matching Anthropic events)
              if (parsed.type === 'message_start') {
                tokensIn = parsed.message?.usage?.input_tokens || tokensIn;
                tokensInCache = parsed.message?.usage?.cache_read_input_tokens || tokensInCache;
                controller.enqueue(encoder.encode(`event: message_start\ndata: ${JSON.stringify(parsed)}\n\n`));
                sentMessageStart = true;
                continue;
              }

              if (parsed.type === 'content_block_start') {
                controller.enqueue(encoder.encode(`event: content_block_start\ndata: ${JSON.stringify(parsed)}\n\n`));
                continue;
              }

              if (parsed.type === 'content_block_delta') {
                const deltaType = parsed.delta?.type;
                if (deltaType === 'text_delta') {
                  if (firstChunkTime === 0) firstChunkTime = Date.now();
                  chunkCount++;
                  currentText += parsed.delta?.text || '';
                  completionText += parsed.delta?.text || '';
                }
                controller.enqueue(encoder.encode(`event: content_block_delta\ndata: ${JSON.stringify(parsed)}\n\n`));
                continue;
              }

              if (parsed.type === 'content_block_stop') {
                controller.enqueue(encoder.encode(`event: content_block_stop\ndata: ${JSON.stringify(parsed)}\n\n`));
                contentBlockIndex++;
                continue;
              }

              if (parsed.type === 'message_delta') {
                tokensOut = parsed.usage?.output_tokens || tokensOut;
                controller.enqueue(encoder.encode(`event: message_delta\ndata: ${JSON.stringify(parsed)}\n\n`));
                continue;
              }

              if (parsed.type === 'message_stop') {
                controller.enqueue(encoder.encode(`event: message_stop\ndata: ${JSON.stringify(parsed)}\n\n`));
                continue;
              }

              if (parsed.type === 'ping') {
                controller.enqueue(encoder.encode(`event: ping\ndata: ${JSON.stringify(parsed)}\n\n`));
                continue;
              }

              // OpenAI format — convert to Anthropic format
              if (parsed.choices) {
                const delta = parsed.choices?.[0]?.delta;
                const finishReason = parsed.choices?.[0]?.finish_reason;

                if (!sentMessageStart) {
                  const startEvent = {
                    type: 'message_start',
                    message: {
                      id: msgId,
                      type: 'message',
                      role: 'assistant',
                      content: [],
                      model: streamData.model,
                      stop_reason: null,
                      usage: { input_tokens: 0, output_tokens: 0 },
                    },
                  };
                  controller.enqueue(encoder.encode(`event: message_start\ndata: ${JSON.stringify(startEvent)}\n\n`));
                  sentMessageStart = true;
                }

                // Handle reasoning_content (Qwen/o1 extended thinking)
                if (delta?.reasoning_content) {
                  if (!sentThinkingBlock) {
                    // Anthropic doesn't have a standard thinking block in all versions,
                    // so we skip emitting thinking blocks and just accumulate for token counting
                    sentThinkingBlock = true;
                  }
                  reasoningText += delta.reasoning_content;
                  // Don't forward reasoning as content — it's internal thinking
                }

                // Handle text content
                if (delta?.content) {
                  if (firstChunkTime === 0) firstChunkTime = Date.now();
                  chunkCount++;
                  completionText += delta.content;
                  // If this is the first text content, emit a text block_start
                  if (currentText === '') {
                    // Close reasoning block if it was open
                    const blockStart = { type: 'content_block_start', index: contentBlockIndex, content_block: { type: 'text', text: '' } };
                    controller.enqueue(encoder.encode(`event: content_block_start\ndata: ${JSON.stringify(blockStart)}\n\n`));
                  }
                  currentText += delta.content;
                  const blockDelta = { type: 'content_block_delta', index: contentBlockIndex, delta: { type: 'text_delta', text: delta.content } };
                  controller.enqueue(encoder.encode(`event: content_block_delta\ndata: ${JSON.stringify(blockDelta)}\n\n`));
                }

                // Handle tool_calls from OpenAI delta
                if (delta?.tool_calls) {
                  for (const tc of delta.tool_calls) {
                    const idx = tc.index ?? 0;
                    while (toolUseBlocks.length <= idx) {
                      toolUseBlocks.push({ id: '', name: '', input: '' });
                    }
                    if (tc.id) toolUseBlocks[idx].id = tc.id;
                    if (tc.function?.name) toolUseBlocks[idx].name = tc.function.name;
                    if (tc.function?.arguments) toolUseBlocks[idx].input += tc.function.arguments;
                  }
                }

                // Capture usage
                if (parsed.usage) {
                  tokensIn = parsed.usage.prompt_tokens || parsed.usage.input_tokens || tokensIn;
                  tokensOut = parsed.usage.completion_tokens || parsed.usage.output_tokens || tokensOut;
                  tokensInCache = parsed.usage.prompt_tokens_details?.cached_tokens || parsed.usage.cache_read_input_tokens || tokensInCache;
                }

                // Handle finish_reason
                if (finishReason) {
                  // Close text block if one was open
                  if (currentText) {
                    controller.enqueue(encoder.encode(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: contentBlockIndex })}\n\n`));
                    contentBlockIndex++;
                    currentText = '';
                  }

                  // Emit tool_use blocks
                  if (toolUseBlocks.length > 0) {
                    for (const tb of toolUseBlocks) {
                      const toolBlockStart = {
                        type: 'content_block_start',
                        index: contentBlockIndex,
                        content_block: { type: 'tool_use', id: tb.id, name: tb.name, input: {} },
                      };
                      controller.enqueue(encoder.encode(`event: content_block_start\ndata: ${JSON.stringify(toolBlockStart)}\n\n`));

                      if (tb.input) {
                        const inputDelta = {
                          type: 'content_block_delta',
                          index: contentBlockIndex,
                          delta: { type: 'input_json_delta', partial_json: tb.input },
                        };
                        controller.enqueue(encoder.encode(`event: content_block_delta\ndata: ${JSON.stringify(inputDelta)}\n\n`));
                      }

                      controller.enqueue(encoder.encode(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: contentBlockIndex })}\n\n`));
                      contentBlockIndex++;
                    }
                    toolUseBlocks = [];
                    sentToolBlocks = true;
                  }

                  const stopReason = finishReason === 'stop' ? 'end_turn'
                    : finishReason === 'length' ? 'max_tokens'
                    : finishReason === 'tool_calls' ? 'tool_use'
                    : 'end_turn';
                  const messageDelta = {
                    type: 'message_delta',
                    delta: { stop_reason: stopReason, stop_sequence: null },
                    usage: { output_tokens: tokensOut },
                  };
                  controller.enqueue(encoder.encode(`event: message_delta\ndata: ${JSON.stringify(messageDelta)}\n\n`));
                  controller.enqueue(encoder.encode(`event: message_stop\ndata: ${JSON.stringify({ type: 'message_stop' })}\n\n`));
                }
              }
              // If parsed has no 'choices' and no 'type' matching Anthropic events, skip silently
            } catch {
              // Not valid JSON, skip
            }
          }
          // Do NOT forward raw text — all output goes through the conversion above
        },
        flush() {
          doLogUsage();
        },
      });

      const upstreamBody = streamData.response.body;
      if (upstreamBody) {
        upstreamBody.pipeTo(transformStream.writable).catch(() => {
          doLogUsage();
        });
      }

      const streamRateHeaders: Record<string, string> = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      };
      if (result.rateLimit) {
        streamRateHeaders['X-RateLimit-Limit'] = String(result.rateLimit.limit);
        streamRateHeaders['X-RateLimit-Remaining'] = String(result.rateLimit.remaining);
        streamRateHeaders['X-RateLimit-Reset'] = String(Math.ceil(result.rateLimit.resetAt / 1000));
      }

      return new Response(transformStream.readable, { headers: streamRateHeaders });
    }

    // Non-streaming
    const result = await processGatewayRequest(gatewayBody, authHeader, 'chat/completions');

    if (!result.success) {
      const res = NextResponse.json(
        { type: 'error', error: { type: 'api_error', message: result.error } },
        { status: result.statusCode || 500 }
      );
      setRateLimitHeaders(res.headers, result.rateLimit);
      if (result.headers) {
        for (const [k, v] of Object.entries(result.headers)) res.headers.set(k, v);
      }
      return res;
    }

    const data = result.data as Record<string, unknown>;
    const usage = (data as { usage?: Record<string, unknown> }).usage || {};

    // Build content blocks from OpenAI response
    const content: Array<Record<string, unknown>> = [];
    const choice = (data as { choices?: Array<{ message?: Record<string, unknown> }> }).choices?.[0]?.message;
    const text = choice?.content as string;
    if (text) {
      content.push({ type: 'text', text });
    }

    // Convert OpenAI tool_calls to Anthropic tool_use content blocks
    const toolCalls = choice?.tool_calls as Array<{ id: string; type: string; function: { name: string; arguments: string } }> | undefined;
    if (toolCalls) {
      for (const tc of toolCalls) {
        let parsedInput: unknown = {};
        try { parsedInput = JSON.parse(tc.function.arguments); } catch { /* keep empty */ }
        content.push({
          type: 'tool_use',
          id: tc.id,
          name: tc.function.name,
          input: parsedInput,
        });
      }
    }

    // Convert OpenAI response to Anthropic format
    const anthropicResponse = {
      id: (data as { id?: string }).id || `msg_${Date.now().toString(36)}`,
      type: 'message',
      role: 'assistant',
      content,
      model: (data as { model?: string }).model || body.model,
      stop_reason: (() => {
        const reason = (data as { choices?: Array<{ finish_reason?: string }> }).choices?.[0]?.finish_reason;
        if (reason === 'stop') return 'end_turn';
        if (reason === 'length') return 'max_tokens';
        if (reason === 'tool_calls') return 'tool_use';
        return 'end_turn';
      })(),
      usage: {
        input_tokens: (usage as { prompt_tokens?: number }).prompt_tokens || (usage as { input_tokens?: number }).input_tokens || 0,
        output_tokens: (usage as { completion_tokens?: number }).completion_tokens || (usage as { output_tokens?: number }).output_tokens || 0,
        cache_creation_input_tokens: (usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens || 0,
        cache_read_input_tokens: (usage as { prompt_tokens_details?: { cached_tokens?: number } }).prompt_tokens_details?.cached_tokens || (usage as { cache_read_input_tokens?: number }).cache_read_input_tokens || 0,
      },
    };

    const res = NextResponse.json(anthropicResponse);
    setRateLimitHeaders(res.headers, result.rateLimit);
    return res;
  } catch (error) {
    console.error('Anthropic messages error:', error);
    return NextResponse.json(
      { type: 'error', error: { type: 'api_error', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
