import { NextRequest, NextResponse } from 'next/server';
import { processGatewayRequest, estimateTokens, setRateLimitHeaders, setDeprecationHeader } from '@/lib/api-gateway';
import { deductCreditsOrBalance, calculateCost, calculateCredits, logUsage, getEffectiveMultiplier } from '@/lib/billing-engine';
import { reportChannelSuccess } from '@/lib/channel-manager';
import { checkPromptCache } from '@/lib/prompt-cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: { message: 'Request body too large (max 10MB)', type: 'invalid_request_error' } },
        { status: 413 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    if (!body.model || typeof body.model !== 'string') {
      return NextResponse.json(
        { error: { message: 'model is required', type: 'invalid_request_error' } },
        { status: 400 }
      );
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: { message: 'messages array is required and must not be empty', type: 'invalid_request_error' } },
        { status: 400 }
      );
    }

    // Validate optional numeric params
    if (body.temperature != null && (typeof body.temperature !== 'number' || body.temperature < 0 || body.temperature > 2)) {
      return NextResponse.json(
        { error: { message: 'temperature must be a number between 0 and 2', type: 'invalid_request_error' } },
        { status: 400 }
      );
    }
    if (body.max_tokens != null && (typeof body.max_tokens !== 'number' || body.max_tokens < 1 || body.max_tokens > 1000000)) {
      return NextResponse.json(
        { error: { message: 'max_tokens must be a number between 1 and 1000000', type: 'invalid_request_error' } },
        { status: 400 }
      );
    }

    // Handle streaming
    if (body.stream) {
      const result = await processGatewayRequest(body, authHeader, 'chat/completions');
      if (!result.success) {
        const res = NextResponse.json(
          { error: { message: result.error, type: 'gateway_error' } },
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

      function doLogUsage() {
        if (logged) return;
        logged = true;

        // Stream completed successfully — report channel health
        reportChannelSuccess(streamData.channelId);

        if (tokensIn === 0) {
          tokensIn = estimateTokens(JSON.stringify(body.messages));
        }
        if (tokensOut === 0 && completionText) {
          tokensOut = estimateTokens(completionText);
        }

        // If upstream didn't report cache stats (VLLM, local providers), use local prompt cache
        if (tokensInCache === 0 && tokensIn > 0) {
          tokensInCache = checkPromptCache(streamData.userId, streamData.model, body.messages, tokensIn).cacheHit;
        }

        const latencyMs = Date.now() - streamData.startTime;
        const ttftMs = firstChunkTime > 0 ? firstChunkTime - streamData.startTime : 0;
        const itlMs = chunkCount > 1 ? (Date.now() - firstChunkTime) / (chunkCount - 1) : 0;
        const { multiplier } = getEffectiveMultiplier(streamData.model);
        const baseCost = calculateCost(streamData.model, tokensIn, tokensOut, tokensInCache);
        const cost = baseCost * multiplier;

        let deductResult: { success: boolean; source: string; creditsUsed?: number } | undefined;
        if (cost > 0) {
          deductResult = deductCreditsOrBalance(streamData.userId, streamData.model, cost, `API call: ${streamData.model}`, tokensIn, tokensOut, tokensInCache);
          if (!deductResult?.success) {
            return NextResponse.json({ error: { message: 'Insufficient balance', type: 'insufficient_balance' } }, { status: 402 });
          }
        }

        logUsage({
          userId: streamData.userId,
          apiKeyId: streamData.apiKeyId,
          channelId: streamData.channelId,
          model: streamData.model,
          tokensIn,
          tokensOut,
          tokensInCache,
          cost: deductResult?.source === 'credits' ? 0 : cost,
          creditsUsed: deductResult?.creditsUsed || 0,
          deductionSource: deductResult?.source || 'balance',
          latencyMs,
          ttftMs,
          itlMs,
          success: true,
          multiplier,
        });
      }

      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          buffer += text;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              // Forward [DONE] as-is — clients need it to know the stream ended
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.usage) {
                  tokensIn = parsed.usage.prompt_tokens || parsed.usage.input_tokens || tokensIn;
                  tokensOut = parsed.usage.completion_tokens || parsed.usage.output_tokens || tokensOut;
                  // OpenAI: prompt_tokens_details.cached_tokens; Anthropic: cache_read_input_tokens
                  tokensInCache = parsed.usage.prompt_tokens_details?.cached_tokens || parsed.usage.cache_read_input_tokens || tokensInCache;
                }
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  if (firstChunkTime === 0) firstChunkTime = Date.now();
                  chunkCount++;
                  completionText += delta;
                }
              } catch {
                // Not valid JSON, skip
              }
            }
          }

          controller.enqueue(encoder.encode(text));
        },
        flush() {
          doLogUsage();
        },
      });

      const upstreamBody = streamData.response.body;
      if (upstreamBody) {
        upstreamBody.pipeTo(transformStream.writable).catch(() => {
          // If pipe fails, still log what we have
          doLogUsage();
        });
      }

      const rateLimitHeaders: Record<string, string> = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      };
      if (result.rateLimit) {
        rateLimitHeaders['X-RateLimit-Limit'] = String(result.rateLimit.limit);
        rateLimitHeaders['X-RateLimit-Remaining'] = String(result.rateLimit.remaining);
        rateLimitHeaders['X-RateLimit-Reset'] = String(Math.ceil(result.rateLimit.resetAt / 1000));
      }

      return new Response(transformStream.readable, { headers: rateLimitHeaders });
    }

    // Non-streaming
    const result = await processGatewayRequest(body, authHeader, 'chat/completions');

    if (!result.success) {
      const res = NextResponse.json(
        { error: { message: result.error, type: 'gateway_error' } },
        { status: result.statusCode || 500 }
      );
      setRateLimitHeaders(res.headers, result.rateLimit);
      if (result.headers) {
        for (const [k, v] of Object.entries(result.headers)) res.headers.set(k, v);
      }
      return res;
    }

    const res = NextResponse.json(result.data);
    setRateLimitHeaders(res.headers, result.rateLimit);
    setDeprecationHeader(res.headers, result.deprecationWarning);
    return res;
  } catch (error) {
    console.error('Chat completions error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'server_error' } },
      { status: 500 }
    );
  }
}
