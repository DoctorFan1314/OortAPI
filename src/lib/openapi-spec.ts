/**
 * OpenAPI 3.0 specification for OortAPI
 * Covers all AI model and management endpoints
 */

const spec = {
  openapi: "3.0.3",
  info: {
    title: "OortAPI",
    description: "Unified AI API Relay Platform — 一个 API Key 聚合 OpenAI、Anthropic、Google、DeepSeek 等多个上游 AI 服务。",
    version: "3.3.5",
    contact: { name: "OortAPI", url: "https://github.com" },
    license: { name: "Apache 2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" },
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "AI Models", description: "AI 模型接口 — 兼容 OpenAI API 格式" },
    { name: "Billing", description: "计费与用量查询" },
    { name: "Auth", description: "用户认证" },
    { name: "Dashboard", description: "仪表盘与管理" },
    { name: "System", description: "系统信息" },
    { name: "Anthropic", description: "Anthropic Messages API 兼容接口" },
    { name: "Admin", description: "管理员接口" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "API Key 认证，格式: Bearer sk-oort-xxxx",
      },
      CookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "oortapi_token",
        description: "JWT Cookie 认证（登录后自动设置）",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
      ChatMessage: {
        type: "object",
        required: ["role", "content"],
        properties: {
          role: { type: "string", enum: ["system", "user", "assistant"] },
          content: { type: "string" },
        },
      },
      Model: {
        type: "object",
        properties: {
          id: { type: "string", example: "gpt-4o" },
          object: { type: "string", example: "model" },
          created: { type: "integer", example: 1700000000 },
          owned_by: { type: "string", example: "openai" },
          display_name: { type: "string", example: "GPT-4o" },
          pricing: {
            type: "object",
            properties: {
              input: { type: "number", example: 0.0025 },
              output: { type: "number", example: 0.01 },
              cache: { type: "number", example: 0.00125 },
            },
          },
        },
      },
      Channel: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", example: "My OpenAI" },
          type: { type: "string", enum: ["openai", "anthropic", "deepseek", "google", "alibaba", "midjourney", "suno"] },
          base_url: { type: "string", nullable: true, example: "https://api.openai.com" },
          weight: { type: "number", example: 1.0 },
          enabled: { type: "integer", enum: [0, 1] },
          models: { type: "string", description: "JSON array of supported model names" },
          model_mapping: { type: "string", description: "JSON object mapping requested→actual model names" },
          status: { type: "string", enum: ["unknown", "online", "offline", "rate_limited"] },
          priority: { type: "integer", example: 0 },
          fail_count: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          username: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
          balance: { type: "number" },
          avatar: { type: "string", nullable: true },
          bio: { type: "string", nullable: true },
          preferences: { type: "string", description: "JSON: {theme, language}" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      ApiKey: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", example: "Default" },
          key_value: { type: "string", example: "sk-oort-abc123..." },
          permissions: { type: "string", description: 'JSON: {"models":["*"]}' },
          rate_limit: { type: "integer", example: 60 },
          enabled: { type: "integer", enum: [0, 1] },
          created_at: { type: "string", format: "date-time" },
          last_used_at: { type: "string", format: "date-time", nullable: true },
          total_calls: { type: "integer" },
        },
      },
      UsageLog: {
        type: "object",
        properties: {
          id: { type: "integer" },
          model: { type: "string" },
          tokens_in: { type: "integer", description: "Total input tokens" },
          tokens_out: { type: "integer", description: "Output tokens" },
          tokens_in_cache: { type: "integer", description: "Cache hit tokens (prompt_tokens_details.cached_tokens)" },
          tokens_cache_creation: { type: "integer", description: "Cache creation tokens (cache_creation_input_tokens)" },
          cost: { type: "number" },
          latency_ms: { type: "integer" },
          success: { type: "integer", enum: [0, 1] },
          cached: { type: "integer", enum: [0, 1] },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Subscription: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          plan_id: { type: "integer" },
          billing_cycle: { type: "string", enum: ["monthly", "yearly"] },
          status: { type: "string", enum: ["active", "cancelled", "expired"] },
          credits_remaining: { type: "number" },
          credits_total: { type: "number" },
          current_period_start: { type: "string", format: "date-time" },
          current_period_end: { type: "string", format: "date-time" },
          auto_renew: { type: "integer", enum: [0, 1] },
          is_first_purchase: { type: "integer", enum: [0, 1] },
          plan_name: { type: "string" },
          plan_display_name: { type: "string" },
          plan_tier: { type: "integer" },
          plan_monthly_credits: { type: "number" },
          plan_monthly_price: { type: "number" },
          plan_yearly_price: { type: "number" },
          plan_currency: { type: "string" },
        },
      },
      MultiplierRule: {
        type: "object",
        properties: {
          id: { type: "integer" },
          model_name: { type: "string" },
          multiplier: { type: "number" },
          enabled: { type: "integer", enum: [0, 1] },
          description: { type: "string", nullable: true },
          input_rate: { type: "number", nullable: true },
          output_rate: { type: "number", nullable: true },
        },
      },
      TimeMultiplierSettings: {
        type: "object",
        properties: {
          id: { type: "integer" },
          day_start: { type: "string", example: "08:00" },
          day_end: { type: "string", example: "22:00" },
          day_rate: { type: "number", example: 1.0 },
          night_rate: { type: "number", example: 0.5 },
          timezone: { type: "string", example: "Asia/Shanghai" },
          enabled: { type: "integer", enum: [0, 1] },
        },
      },
      RedeemCode: {
        type: "object",
        properties: {
          id: { type: "integer" },
          code: { type: "string", example: "RC-ABCD1234" },
          amount: { type: "number" },
          code_type: { type: "string", enum: ["balance", "subscription"] },
          plan_id: { type: "integer", nullable: true },
          billing_cycle: { type: "string", enum: ["monthly", "yearly"] },
          duration_months: { type: "integer" },
          max_uses: { type: "integer" },
          used_count: { type: "integer" },
          enabled: { type: "integer", enum: [0, 1] },
          created_by: { type: "integer" },
          expires_at: { type: "string", format: "date-time", nullable: true },
          created_at: { type: "string", format: "date-time" },
          plan_display_name: { type: "string", nullable: true },
        },
      },
      BillingRecord: {
        type: "object",
        properties: {
          id: { type: "integer" },
          amount: { type: "number" },
          type: { type: "string", example: "recharge" },
          description: { type: "string" },
          balance_after: { type: "number" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      SubscriptionPlan: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", example: "free" },
          display_name: { type: "string", example: "Free" },
          tagline: { type: "string", nullable: true },
          tier: { type: "integer" },
          monthly_price: { type: "number" },
          yearly_price: { type: "number" },
          currency: { type: "string", example: "CNY" },
          monthly_credits: { type: "number" },
          first_purchase_discount: { type: "number" },
          overage_rate_multiplier: { type: "number" },
          max_concurrency: { type: "integer" },
          route_priority: { type: "string" },
          off_peak_discount: { type: "number" },
          support_level: { type: "string" },
          popular: { type: "integer", enum: [0, 1] },
          enabled: { type: "integer", enum: [0, 1] },
          models: { type: "array", items: { type: "string" }, description: "Available models (public plans only)" },
        },
      },
    },
  },
  paths: {
    // ─── AI Model Endpoints ───
    "/v1/chat/completions": {
      post: {
        tags: ["AI Models"],
        summary: "聊天补全",
        description: "创建聊天补全请求，兼容 OpenAI Chat Completions API。支持流式和非流式响应。",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model", "messages"],
                properties: {
                  model: { type: "string", example: "gpt-4o", description: "模型名称" },
                  messages: { type: "array", items: { $ref: "#/components/schemas/ChatMessage" } },
                  stream: { type: "boolean", default: false, description: "是否启用流式响应" },
                  temperature: { type: "number", minimum: 0, maximum: 2 },
                  top_p: { type: "number", minimum: 0, maximum: 1 },
                  max_tokens: { type: "integer", minimum: 1 },
                  n: { type: "integer", minimum: 1, default: 1 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    object: { type: "string", example: "chat.completion" },
                    model: { type: "string" },
                    choices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          index: { type: "integer" },
                          message: { $ref: "#/components/schemas/ChatMessage" },
                          finish_reason: { type: "string" },
                        },
                      },
                    },
                    usage: {
                      type: "object",
                      properties: {
                        prompt_tokens: { type: "integer" },
                        completion_tokens: { type: "integer" },
                        total_tokens: { type: "integer" },
                      },
                    },
                  },
                },
              },
              "text/event-stream": {
                schema: { type: "string", description: "SSE stream (when stream=true)" },
              },
            },
          },
          "401": { description: "无效的 API Key" },
          "402": { description: "余额不足" },
          "429": { description: "请求频率超限" },
          "502": { description: "上游服务错误" },
        },
      },
    },
    "/v1/completions": {
      post: {
        tags: ["AI Models"],
        summary: "文本补全",
        description: "传统文本补全接口，兼容 OpenAI Completions API。",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model"],
                properties: {
                  model: { type: "string", example: "gpt-3.5-turbo-instruct" },
                  prompt: { type: "string", example: "Say hello" },
                  stream: { type: "boolean", default: false },
                  temperature: { type: "number" },
                  max_tokens: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功" },
          "401": { description: "无效的 API Key" },
        },
      },
    },
    "/v1/embeddings": {
      post: {
        tags: ["AI Models"],
        summary: "文本嵌入",
        description: "生成文本嵌入向量，兼容 OpenAI Embeddings API。",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model", "input"],
                properties: {
                  model: { type: "string", example: "text-embedding-3-small" },
                  input: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }], example: "Hello world" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功" },
          "401": { description: "无效的 API Key" },
        },
      },
    },
    "/v1/images/generations": {
      post: {
        tags: ["AI Models"],
        summary: "图像生成",
        description: "AI 图像生成接口，兼容 OpenAI Images API。",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model"],
                properties: {
                  model: { type: "string", example: "dall-e-3" },
                  prompt: { type: "string", example: "A cute cat wearing a hat" },
                  n: { type: "integer", default: 1 },
                  size: { type: "string", example: "1024x1024" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功" },
          "401": { description: "无效的 API Key" },
        },
      },
    },
    "/v1/models": {
      get: {
        tags: ["AI Models"],
        summary: "模型列表",
        description: "获取所有可用模型及其定价信息。无需认证。",
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    object: { type: "string", example: "list" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Model" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ─── Billing ───
    "/v1/billing/balance": {
      get: {
        tags: ["Billing"],
        summary: "查询余额",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    balance: { type: "number", example: 10.0 },
                    currency: { type: "string", example: "USD" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/v1/billing/usage": {
      get: {
        tags: ["Billing"],
        summary: "用量记录",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    object: { type: "string", example: "list" },
                    data: { type: "array", items: { $ref: "#/components/schemas/UsageLog" } },
                    total: { type: "integer" },
                    has_more: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ─── Auth ───
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "用户登录",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "成功，设置 httpOnly cookie",
            content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } },
          },
          "401": { description: "邮箱或密码错误" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "用户注册",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功，自动登录并赠送初始余额" },
          "409": { description: "邮箱已被注册" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "获取当前用户",
        security: [{ CookieAuth: [] }],
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } } },
          "401": { description: "未登录" },
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "退出登录",
        responses: { "200": { description: "成功，清除 cookie" } },
      },
    },
    "/api/auth/profile": {
      patch: {
        tags: ["Auth"],
        summary: "更新个人资料",
        security: [{ CookieAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  avatar: { type: "string" },
                  bio: { type: "string" },
                  preferences: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功" },
          "401": { description: "未登录" },
        },
      },
    },
    "/api/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "修改密码",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功" },
          "400": { description: "当前密码错误" },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "请求密码重置",
        description: "发送密码重置邮件。为防止用户枚举，无论邮箱是否存在均返回成功。每 IP 限 3 次/分钟。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", description: "注册邮箱" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功（始终返回，不泄露邮箱是否存在）", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
          "400": { description: "邮箱格式无效" },
          "429": { description: "请求过于频繁" },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "重置密码",
        description: "使用邮箱中收到的令牌重置密码。令牌有效期 30 分钟。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "token", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  token: { type: "string", description: "重置令牌（64 位十六进制）" },
                  password: { type: "string", minLength: 6, description: "新密码" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
          "400": { description: "令牌无效或已过期、密码不符合要求" },
        },
      },
    },
    "/api/auth/delete-account": {
      delete: {
        tags: ["Auth"],
        summary: "删除账户",
        description: "删除当前用户账户及所有关联数据（用量记录、账单、API Key、会话）。需验证密码。最后一个管理员不可删除。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  password: { type: "string", description: "当前密码" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功，账户已删除并清除 cookie", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
          "400": { description: "未提供密码" },
          "401": { description: "未登录" },
          "403": { description: "密码错误或尝试删除最后一个管理员" },
          "404": { description: "用户不存在" },
        },
      },
    },
    // ─── Dashboard ───
    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "仪表盘统计",
        description: "获取今日/本月调用量、费用、token 使用量、热门模型等统计数据。",
        security: [{ CookieAuth: [] }],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    today: {
                      type: "object",
                      properties: {
                        calls: { type: "integer" },
                        success_rate: { type: "number" },
                        cost: { type: "number" },
                        tokens: { type: "integer" },
                        avg_latency: { type: "number" },
                      },
                    },
                    month: {
                      type: "object",
                      properties: {
                        calls: { type: "integer" },
                        cost: { type: "number" },
                        tokens: { type: "integer" },
                      },
                    },
                    active_keys: { type: "integer" },
                    daily_usage: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: { type: "string" },
                          calls: { type: "integer" },
                          cost: { type: "number" },
                          tokens: { type: "integer" },
                        },
                      },
                    },
                    top_models: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          model: { type: "string" },
                          calls: { type: "integer" },
                          cost: { type: "number" },
                        },
                      },
                    },
                    balance: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/dashboard/keys": {
      get: {
        tags: ["Dashboard"],
        summary: "API Key 列表",
        security: [{ CookieAuth: [] }],
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { keys: { type: "array", items: { $ref: "#/components/schemas/ApiKey" } } } } } } },
        },
      },
      post: {
        tags: ["Dashboard"],
        summary: "创建 API Key",
        security: [{ CookieAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", default: "Default" },
                  rate_limit: { type: "integer", default: 60 },
                  permissions: { type: "object" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "成功" } },
      },
      patch: {
        tags: ["Dashboard"],
        summary: "更新 API Key",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  enabled: { type: "boolean" },
                  rate_limit: { type: "integer" },
                  permissions: { type: "object" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "成功" } },
      },
      delete: {
        tags: ["Dashboard"],
        summary: "删除 API Key",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["id"], properties: { id: { type: "integer" } } } } },
        },
        responses: { "200": { description: "成功" } },
      },
    },
    "/api/dashboard/channels": {
      get: {
        tags: ["Dashboard"],
        summary: "渠道列表",
        description: "获取所有渠道（仅管理员）。",
        security: [{ CookieAuth: [] }],
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { channels: { type: "array", items: { $ref: "#/components/schemas/Channel" } } } } } } },
          "403": { description: "需要管理员权限" },
        },
      },
      post: {
        tags: ["Dashboard"],
        summary: "创建渠道",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "type", "api_key_encrypted"],
                properties: {
                  name: { type: "string", example: "My OpenAI" },
                  type: { type: "string", enum: ["openai", "anthropic", "deepseek", "google", "alibaba", "midjourney", "suno"] },
                  api_key_encrypted: { type: "string", description: "上游 API Key" },
                  base_url: { type: "string", example: "https://api.openai.com" },
                  weight: { type: "number", default: 1.0 },
                  priority: { type: "integer", default: 0 },
                  models: { type: "array", items: { type: "string" }, description: "支持的模型列表，空数组=全部" },
                  model_mapping: { type: "object", description: "模型名映射" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
      patch: {
        tags: ["Dashboard"],
        summary: "更新渠道",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  type: { type: "string" },
                  api_key_encrypted: { type: "string" },
                  base_url: { type: "string" },
                  weight: { type: "number" },
                  enabled: { type: "boolean" },
                  models: { type: "array", items: { type: "string" } },
                  model_mapping: { type: "object" },
                  priority: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
      delete: {
        tags: ["Dashboard"],
        summary: "删除渠道",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["id"], properties: { id: { type: "integer" } } } } },
        },
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
    },
    // ─── Dashboard: Subscription ───
    "/api/dashboard/subscription": {
      get: {
        tags: ["Dashboard"],
        summary: "获取用户订阅",
        description: "获取当前用户的所有订阅信息，包含关联的计划详情。活跃订阅的额度会自动与计划同步。",
        security: [{ CookieAuth: [] }],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    subscriptions: { type: "array", items: { $ref: "#/components/schemas/Subscription" } },
                  },
                },
              },
            },
          },
          "401": { description: "未登录" },
          "500": { description: "服务器错误" },
        },
      },
      patch: {
        tags: ["Dashboard"],
        summary: "管理订阅",
        description: "对活跃订阅执行操作：取消（按比例退款）、切换自动续费、升级/降级（按比例折算额度）。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["subscription_id", "action"],
                properties: {
                  subscription_id: { type: "integer", description: "订阅 ID" },
                  action: { type: "string", enum: ["cancel", "toggle_auto_renew", "upgrade", "downgrade"], description: "操作类型" },
                  plan_id: { type: "integer", description: "目标计划 ID（upgrade/downgrade 时必填）" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    refund: { type: "number", description: "取消时的退款金额" },
                    auto_renew: { type: "boolean", description: "切换自动续费后的新状态" },
                    message: { type: "string", description: "升级/降级结果消息" },
                    prorated_credits: { type: "integer", description: "升级/降级时折算的额度" },
                    new_plan: { type: "string", description: "升级/降级后的新计划名称" },
                  },
                },
              },
            },
          },
          "400": { description: "参数缺失或无效" },
          "401": { description: "未登录" },
          "404": { description: "订阅或计划不存在" },
          "500": { description: "服务器错误" },
        },
      },
    },
    // ─── Dashboard: Multiplier ───
    "/api/dashboard/multiplier": {
      get: {
        tags: ["Admin"],
        summary: "获取倍率规则",
        description: "获取所有模型倍率规则和时段倍率设置（管理员）。",
        security: [{ CookieAuth: [] }],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    rules: { type: "array", items: { $ref: "#/components/schemas/MultiplierRule" } },
                    time_settings: { $ref: "#/components/schemas/TimeMultiplierSettings" },
                  },
                },
              },
            },
          },
          "403": { description: "需要管理员权限" },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "添加倍率规则",
        description: "创建或更新模型倍率规则，或更新时段倍率设置。传入 type=time_settings 时更新时段设置。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["time_settings"], description: "设为 time_settings 以更新时段设置" },
                  model_name: { type: "string", description: "模型名称（规则模式必填）" },
                  multiplier: { type: "number", minimum: 0.01, maximum: 100, description: "倍率值" },
                  enabled: { type: "boolean" },
                  description: { type: "string" },
                  day_start: { type: "string", description: "白天开始时间，如 08:00" },
                  day_end: { type: "string", description: "白天结束时间，如 22:00" },
                  day_rate: { type: "number", description: "白天倍率" },
                  night_rate: { type: "number", description: "夜间倍率" },
                  timezone: { type: "string", description: "时区" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
          "400": { description: "参数缺失或无效" },
          "403": { description: "需要管理员权限" },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "更新倍率规则",
        description: "更新现有模型倍率规则（与 POST 共享逻辑，通过 model_name 匹配 upsert）。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model_name"],
                properties: {
                  model_name: { type: "string", description: "模型名称" },
                  multiplier: { type: "number", minimum: 0.01, maximum: 100 },
                  enabled: { type: "boolean" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
          "400": { description: "参数缺失或无效" },
          "403": { description: "需要管理员权限" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "删除倍率规则",
        description: "按模型名称删除倍率规则。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model_name"],
                properties: {
                  model_name: { type: "string", description: "要删除的模型名称" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
          "400": { description: "model_name 缺失" },
          "403": { description: "需要管理员权限" },
        },
      },
    },
    // ─── Dashboard: Redeem Codes ───
    "/api/dashboard/redeem": {
      get: {
        tags: ["Admin"],
        summary: "兑换码列表",
        description: "分页获取所有兑换码（管理员）。支持 page/limit 分页。",
        security: [{ CookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
        ],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    codes: { type: "array", items: { $ref: "#/components/schemas/RedeemCode" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    has_more: { type: "boolean" },
                  },
                },
              },
            },
          },
          "403": { description: "需要管理员权限" },
          "500": { description: "服务器错误" },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "生成兑换码",
        description: "批量生成兑换码（最多 100 个）。支持余额和订阅两种类型。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  count: { type: "integer", minimum: 1, maximum: 100, default: 1, description: "生成数量" },
                  amount: { type: "number", description: "余额类型兑换码的金额" },
                  maxUses: { type: "integer", minimum: 1, default: 1, description: "每码最大使用次数" },
                  expiresAt: { type: "string", format: "date-time", description: "过期时间" },
                  codeType: { type: "string", enum: ["balance", "subscription"], default: "balance", description: "兑换码类型" },
                  planId: { type: "integer", description: "订阅类型兑换码的计划 ID" },
                  billingCycle: { type: "string", enum: ["monthly", "yearly"], default: "monthly" },
                  durationMonths: { type: "integer", default: 1, description: "订阅时长（月）" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    codes: { type: "array", items: { type: "string" } },
                    count: { type: "integer" },
                    amount: { type: "number" },
                    maxUses: { type: "integer" },
                    codeType: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "参数无效" },
          "403": { description: "需要管理员权限" },
          "500": { description: "服务器错误" },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "更新兑换码",
        description: "启用/禁用单个或批量兑换码。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "integer", description: "单个兑换码 ID" },
                  ids: { type: "array", items: { type: "integer" }, description: "批量兑换码 ID 列表" },
                  enabled: { type: "boolean", description: "是否启用" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, updated: { type: "integer" } } } } } },
          "400": { description: "参数无效" },
          "403": { description: "需要管理员权限" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "删除兑换码",
        description: "删除单个或批量兑换码。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: { type: "integer", description: "单个兑换码 ID" },
                  ids: { type: "array", items: { type: "integer" }, description: "批量兑换码 ID 列表" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, deleted: { type: "integer" } } } } } },
          "400": { description: "参数无效" },
          "403": { description: "需要管理员权限" },
        },
      },
    },
    // ─── Dashboard: Billing ───
    "/api/dashboard/billing": {
      get: {
        tags: ["Dashboard"],
        summary: "账单记录",
        description: "获取当前用户的账单记录，支持筛选、分页和 CSV 导出。包含月度费用趋势。",
        security: [{ CookieAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          { name: "type", in: "query", schema: { type: "string" }, description: "筛选类型（recharge, usage, refund 等）" },
          { name: "from", in: "query", schema: { type: "string", format: "date" }, description: "起始日期" },
          { name: "to", in: "query", schema: { type: "string", format: "date" }, description: "截止日期" },
          { name: "format", in: "query", schema: { type: "string", enum: ["json", "csv"] }, description: "返回格式，csv 时下载文件" },
        ],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    records: { type: "array", items: { $ref: "#/components/schemas/BillingRecord" } },
                    total: { type: "integer" },
                    has_more: { type: "boolean" },
                    monthly_trend: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          month: { type: "string", example: "2026-01" },
                          cost: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
              "text/csv": {
                schema: { type: "string", description: "CSV 文件（format=csv 时）" },
              },
            },
          },
          "401": { description: "未登录" },
          "500": { description: "服务器错误" },
        },
      },
    },
    // ─── Dashboard: Settings ───
    "/api/dashboard/settings": {
      get: {
        tags: ["Dashboard"],
        summary: "获取系统设置",
        description: "普通用户返回公开设置（currency, exchange_rate, timezone）和个人偏好。管理员返回全部系统设置。支持 action=export 导出完整配置。",
        security: [{ CookieAuth: [] }],
        parameters: [
          { name: "action", in: "query", schema: { type: "string", enum: ["export"] }, description: "设为 export 以导出完整配置（管理员）" },
        ],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    settings: { type: "object", additionalProperties: { type: "string" } },
                    preferences: { type: "object", description: "用户偏好（普通用户）" },
                  },
                },
              },
            },
          },
          "401": { description: "未登录" },
          "500": { description: "服务器错误" },
        },
      },
      patch: {
        tags: ["Dashboard"],
        summary: "更新设置",
        description: "普通用户可更新 monthly_budget。管理员可更新系统设置（site_name, registration_enabled, default_rate_limit, default_balance, maintenance_mode, currency, exchange_rate, timezone）。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  monthly_budget: { type: "number", nullable: true, description: "个人月度预算（普通用户），设为 null 删除限制" },
                  site_name: { type: "string", description: "站点名称（管理员）" },
                  registration_enabled: { type: "string", enum: ["true", "false"], description: "是否开放注册（管理员）" },
                  default_rate_limit: { type: "string", description: "默认速率限制（管理员）" },
                  default_balance: { type: "string", description: "默认初始余额（管理员）" },
                  maintenance_mode: { type: "string", enum: ["true", "false"], description: "维护模式（管理员）" },
                  currency: { type: "string", description: "默认货币（管理员）" },
                  exchange_rate: { type: "string", description: "汇率（管理员）" },
                  timezone: { type: "string", description: "时区（管理员）" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    settings: { type: "object", additionalProperties: { type: "string" } },
                    success: { type: "boolean" },
                    preferences: { type: "object" },
                  },
                },
              },
            },
          },
          "401": { description: "未登录" },
          "403": { description: "需要管理员权限（更新系统设置时）" },
          "500": { description: "服务器错误" },
        },
      },
    },
    // ─── Admin: Monitor ───
    "/api/dashboard/admin/monitor": {
      get: {
        tags: ["Admin"],
        summary: "系统监控",
        description: "获取过去 24 小时的系统监控数据：QPS、错误率、延迟百分位、各服务商统计和小时趋势。",
        security: [{ CookieAuth: [] }],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    qps: { type: "number", description: "每秒请求数" },
                    error_rate: { type: "number", description: "错误率百分比" },
                    p50_latency: { type: "integer", description: "P50 延迟（毫秒）" },
                    p95_latency: { type: "integer", description: "P95 延迟（毫秒）" },
                    total_calls_24h: { type: "integer" },
                    total_cost_24h: { type: "number" },
                    total_tokens_24h: { type: "integer" },
                    providers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          provider: { type: "string" },
                          calls: { type: "integer" },
                          error_rate: { type: "number" },
                          avg_latency: { type: "integer" },
                        },
                      },
                    },
                    hourly_trend: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          hour: { type: "string", example: "14:00" },
                          calls: { type: "integer" },
                          failed: { type: "integer" },
                          avg_latency: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "403": { description: "需要管理员权限" },
          "500": { description: "服务器错误" },
        },
      },
    },
    // ─── Admin: Plans ───
    "/api/dashboard/admin/plans": {
      get: {
        tags: ["Admin"],
        summary: "订阅计划管理列表",
        description: "获取所有订阅计划（含禁用的）。支持 action=stats 获取各计划的订阅统计和收入数据。",
        security: [{ CookieAuth: [] }],
        parameters: [
          { name: "action", in: "query", schema: { type: "string", enum: ["stats"] }, description: "设为 stats 以获取计划统计数据" },
        ],
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plans: { type: "array", items: { $ref: "#/components/schemas/SubscriptionPlan" } },
                    stats: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          plan_id: { type: "integer" },
                          plan_name: { type: "string" },
                          active_subs: { type: "integer" },
                          monthly_revenue: { type: "number" },
                          credits_used: { type: "number" },
                          credits_usage_rate: { type: "integer" },
                        },
                      },
                    },
                    total_subs: { type: "integer" },
                    total_monthly_revenue: { type: "number" },
                  },
                },
              },
            },
          },
          "403": { description: "需要管理员权限" },
          "500": { description: "服务器错误" },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "创建订阅计划",
        description: "创建新的订阅计划。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "display_name", "tier", "monthly_price", "yearly_price", "monthly_credits"],
                properties: {
                  name: { type: "string", description: "计划标识名" },
                  display_name: { type: "string", description: "显示名称" },
                  tagline: { type: "string" },
                  tier: { type: "integer", description: "层级（数字越小越低级）" },
                  monthly_price: { type: "number" },
                  yearly_price: { type: "number" },
                  currency: { type: "string", default: "CNY" },
                  monthly_credits: { type: "number" },
                  first_purchase_discount: { type: "number", default: 0.3 },
                  overage_rate_multiplier: { type: "number", default: 1.0 },
                  max_concurrency: { type: "integer", default: 10 },
                  route_priority: { type: "string", default: "standard" },
                  off_peak_discount: { type: "number", default: 0 },
                  support_level: { type: "string", default: "community" },
                  popular: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "创建成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plan: { $ref: "#/components/schemas/SubscriptionPlan" },
                  },
                },
              },
            },
          },
          "400": { description: "缺少必填字段" },
          "403": { description: "需要管理员权限" },
          "500": { description: "服务器错误" },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "更新订阅计划",
        description: "更新计划字段。修改 monthly_credits 时会自动同步活跃订阅的额度。",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: {
                  id: { type: "integer", description: "计划 ID" },
                  name: { type: "string" },
                  display_name: { type: "string" },
                  tagline: { type: "string" },
                  tier: { type: "integer" },
                  monthly_price: { type: "number" },
                  yearly_price: { type: "number" },
                  currency: { type: "string" },
                  monthly_credits: { type: "number" },
                  first_purchase_discount: { type: "number" },
                  overage_rate_multiplier: { type: "number" },
                  max_concurrency: { type: "integer" },
                  route_priority: { type: "string" },
                  off_peak_discount: { type: "number" },
                  support_level: { type: "string" },
                  enabled: { type: "boolean" },
                  popular: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plan: { $ref: "#/components/schemas/SubscriptionPlan" },
                  },
                },
              },
            },
          },
          "400": { description: "无有效字段或 ID 缺失" },
          "403": { description: "需要管理员权限" },
          "404": { description: "计划不存在" },
          "500": { description: "服务器错误" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "删除订阅计划",
        description: "按 ID 删除订阅计划。",
        security: [{ CookieAuth: [] }],
        parameters: [
          { name: "id", in: "query", required: true, schema: { type: "integer" }, description: "计划 ID" },
        ],
        responses: {
          "200": { description: "成功", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
          "400": { description: "ID 缺失" },
          "403": { description: "需要管理员权限" },
          "404": { description: "计划不存在" },
          "500": { description: "服务器错误" },
        },
      },
    },
    // ─── Anthropic Compatible ───
    "/v1/messages": {
      post: {
        tags: ["Anthropic"],
        summary: "Anthropic Messages API",
        description: "兼容 Anthropic Messages API 格式的中转接口。",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["model", "messages"],
                properties: {
                  model: { type: "string", example: "claude-sonnet-4-20250514" },
                  messages: { type: "array" },
                  max_tokens: { type: "integer" },
                  stream: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "成功" }, "401": { description: "无效的 API Key" } },
      },
    },
    // ─── Additional Billing ───
    "/v1/billing/redeem": {
      post: {
        tags: ["Billing"],
        summary: "兑换码",
        description: "使用兑换码充值余额或激活订阅。",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["code"], properties: { code: { type: "string" } } } } },
        },
        responses: { "200": { description: "成功" }, "400": { description: "无效或已使用的兑换码" } },
      },
    },
    // ─── Dashboard Management ───
    "/api/dashboard/models": {
      get: {
        tags: ["Dashboard"],
        summary: "模型定价列表",
        security: [{ CookieAuth: [] }],
        responses: { "200": { description: "成功" } },
      },
      post: {
        tags: ["Dashboard"],
        summary: "创建模型定价",
        security: [{ CookieAuth: [] }],
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
      patch: {
        tags: ["Dashboard"],
        summary: "更新模型定价",
        security: [{ CookieAuth: [] }],
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
      delete: {
        tags: ["Dashboard"],
        summary: "删除模型定价",
        security: [{ CookieAuth: [] }],
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
    },
    "/api/dashboard/users": {
      get: {
        tags: ["Admin"],
        summary: "用户列表",
        security: [{ CookieAuth: [] }],
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
      patch: {
        tags: ["Admin"],
        summary: "更新用户（角色/余额/密码重置）",
        security: [{ CookieAuth: [] }],
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "删除用户",
        security: [{ CookieAuth: [] }],
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
    },
    "/api/dashboard/audit": {
      get: {
        tags: ["Admin"],
        summary: "审计日志",
        security: [{ CookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
        ],
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
    },
    "/api/dashboard/webhooks": {
      get: {
        tags: ["Admin"],
        summary: "Webhook 列表",
        security: [{ CookieAuth: [] }],
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
      post: {
        tags: ["Admin"],
        summary: "创建 Webhook",
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["url", "events"], properties: { url: { type: "string" }, events: { type: "array", items: { type: "string" } } } } } },
        },
        responses: { "200": { description: "成功" }, "403": { description: "需要管理员权限" } },
      },
    },
    // ─── System ───
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "健康检查",
        description: "返回系统健康状态、数据库延迟、渠道数、活跃用户数。无需认证。",
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    version: { type: "string" },
                    db_latency_ms: { type: "number" },
                    channels: { type: "integer" },
                    active_users_24h: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/plans": {
      get: {
        tags: ["System"],
        summary: "订阅计划列表",
        description: "获取所有启用的公开订阅计划及其关联模型列表。无需认证。",
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plans: { type: "array", items: { $ref: "#/components/schemas/SubscriptionPlan" } },
                  },
                },
              },
            },
          },
          "500": { description: "服务器错误" },
        },
      },
    },
    "/api/stats": {
      get: {
        tags: ["System"],
        summary: "平台公开统计",
        description: "获取平台公开统计数据：总调用量、可用模型数、成功率、平均延迟。无需认证。",
        responses: {
          "200": {
            description: "成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalCalls: { type: "integer", description: "总调用量" },
                    totalModels: { type: "integer", description: "可用模型数" },
                    uptime: { type: "string", example: "99.5%", description: "过去 24 小时成功率" },
                    avgLatency: { type: "string", example: "200ms", description: "过去 24 小时平均延迟" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function getOpenAPISpec() {
  return spec;
}
