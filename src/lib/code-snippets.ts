/** Multi-language code snippets for the Hero mock terminal */

export const CODE_SNIPPETS = {
  curl: {
    code: `curl https://api.oortapi.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-oort-xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'`,
    response: `data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1747654321,"model":"gpt-4o","choices":[{"index":0,"delta":{"role":"assistant","content":""}}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"usage":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"! I"},"usage":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"'m an"},"usage":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" AI"}}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" assistant"}}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" ready"}}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" to"}}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" help"}}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":" you"}}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"!"}}]}

data: [DONE]`,
    usage: { prompt_tokens: 24, completion_tokens: 11, total_tokens: 35 },
  },
  python: {
    code: `from openai import OpenAI

client = OpenAI(
    api_key="sk-oort-xxxxxxxxxxxx",
    base_url="https://api.oortapi.com/api/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in response:
    delta = chunk.choices[0].delta
    if delta.content:
        print(delta.content, end="")`,
    response: `Hello! I'm an AI assistant ready to help you.

Token usage:
  prompt_tokens: 24
  completion_tokens: 11
  total_tokens: 35`,
    usage: { prompt_tokens: 24, completion_tokens: 11, total_tokens: 35 },
  },
  node: {
    code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-oort-xxxxxxxxxxxx",
  baseURL: "https://api.oortapi.com/api/v1",
});

const stream = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}`,
    response: `Hello! I'm an AI assistant ready to help you.

Token usage:
  prompt_tokens: 24
  completion_tokens: 11
  total_tokens: 35`,
    usage: { prompt_tokens: 24, completion_tokens: 11, total_tokens: 35 },
  },
};

export type SnippetLang = keyof typeof CODE_SNIPPETS;
