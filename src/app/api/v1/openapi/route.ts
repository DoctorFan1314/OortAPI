import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'OortAPI',
    description: 'Unified AI API relay — OpenAI-compatible endpoint for multiple providers',
    version: '3.3.2',
  },
  servers: [
    { url: '/api/v1', description: 'API v1' },
  ],
  security: [{ BearerAuth: [] }],
  paths: {
    '/chat/completions': {
      post: {
        operationId: 'createChatCompletion',
        summary: 'Create a chat completion',
        tags: ['Chat'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatCompletionRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Chat completion response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatCompletionResponse' },
              },
              'text/event-stream': {
                schema: { type: 'string' },
              },
            },
          },
          '401': { description: 'Invalid or missing API key' },
          '402': { description: 'Insufficient balance' },
          '429': { description: 'Rate limit exceeded' },
          '502': { description: 'Upstream provider error' },
          '503': { description: 'No available channel for model' },
        },
      },
    },
    '/completions': {
      post: {
        operationId: 'createCompletion',
        summary: 'Create a text completion',
        tags: ['Completions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['model', 'prompt'],
                properties: {
                  model: { type: 'string' },
                  prompt: { type: 'string' },
                  stream: { type: 'boolean', default: false },
                  max_tokens: { type: 'integer' },
                  temperature: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Completion response' },
          '401': { description: 'Invalid or missing API key' },
        },
      },
    },
    '/images/generations': {
      post: {
        operationId: 'createImage',
        summary: 'Generate an image',
        tags: ['Images'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['model'],
                properties: {
                  model: { type: 'string' },
                  prompt: { type: 'string' },
                  input: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                  n: { type: 'integer', default: 1 },
                  size: { type: 'string', example: '1024x1024' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Image generation response' },
          '401': { description: 'Invalid or missing API key' },
        },
      },
    },
    '/embeddings': {
      post: {
        operationId: 'createEmbedding',
        summary: 'Create embeddings',
        tags: ['Embeddings'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['model', 'input'],
                properties: {
                  model: { type: 'string' },
                  input: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Embedding response' },
          '401': { description: 'Invalid or missing API key' },
        },
      },
    },
    '/models': {
      get: {
        operationId: 'listModels',
        summary: 'List available models',
        tags: ['Models'],
        responses: {
          '200': {
            description: 'Model list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Model' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/billing/balance': {
      get: {
        operationId: 'getBalance',
        summary: 'Get account balance',
        tags: ['Billing'],
        responses: {
          '200': { description: 'Balance response' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/billing/usage': {
      get: {
        operationId: 'getUsage',
        summary: 'Get usage logs',
        tags: ['Billing'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          '200': { description: 'Usage logs' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/billing/redeem': {
      post: {
        operationId: 'redeemCode',
        summary: 'Redeem a gift code',
        tags: ['Billing'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code'],
                properties: { code: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Redemption result' },
          '400': { description: 'Invalid code' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/messages': {
      post: {
        operationId: 'createMessage',
        summary: 'Create a message (Anthropic-compatible)',
        tags: ['Messages'],
        description: 'Anthropic-compatible endpoint. Accepts x-api-key header and Anthropic request/response format.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['model', 'messages'],
                properties: {
                  model: { type: 'string' },
                  messages: { type: 'array', items: { type: 'object' } },
                  max_tokens: { type: 'integer' },
                  stream: { type: 'boolean', default: false },
                  tools: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Message response (Anthropic format)' },
          '401': { description: 'Invalid or missing API key' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'API key (sk-oort-...) from your dashboard',
      },
    },
    schemas: {
      ChatCompletionRequest: {
        type: 'object',
        required: ['model', 'messages'],
        properties: {
          model: { type: 'string', description: 'Model identifier' },
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['system', 'user', 'assistant', 'tool'] },
                content: { oneOf: [{ type: 'string' }, { type: 'array' }] },
              },
            },
          },
          stream: { type: 'boolean', default: false },
          temperature: { type: 'number', minimum: 0, maximum: 2 },
          top_p: { type: 'number', minimum: 0, maximum: 1 },
          max_tokens: { type: 'integer' },
          tools: { type: 'array', items: { type: 'object' } },
          tool_choice: { oneOf: [{ type: 'string' }, { type: 'object' }] },
          response_format: { type: 'object' },
          stop: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
        },
      },
      ChatCompletionResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          object: { type: 'string' },
          created: { type: 'integer' },
          model: { type: 'string' },
          choices: { type: 'array', items: { type: 'object' } },
          usage: {
            type: 'object',
            properties: {
              prompt_tokens: { type: 'integer' },
              completion_tokens: { type: 'integer' },
              total_tokens: { type: 'integer' },
            },
          },
        },
      },
      Model: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          object: { type: 'string', default: 'model' },
          created: { type: 'integer' },
          owned_by: { type: 'string' },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
