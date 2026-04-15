/**
 * TrainedBy  -  Anthropic Claude API Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin wrapper around the Anthropic Messages API.
 * Supports claude-3-5-haiku (fast, cheap  -  support/growth agents)
 * and claude-3-5-sonnet (better writing  -  content/meta agents).
 *
 * Anthropic API differs from OpenAI:
 *   - Endpoint: https://api.anthropic.com/v1/messages
 *   - Auth header: x-api-key (not Authorization: Bearer)
 *   - Version header: anthropic-version: 2023-06-01
 *   - Body: { model, max_tokens, system, messages: [{role, content}] }
 *   - Response: { content: [{type: 'text', text: '...'}] }
 */

export type ClaudeModel =
  | 'claude-haiku-4-5'    // Fast, cheap  -  support & growth agents
  | 'claude-sonnet-4-5'   // Better prose  -  content & meta agents

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeOptions {
  model?: ClaudeModel;
  system?: string;
  messages: ClaudeMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface ClaudeResponse {
  text: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
}

/**
 * Call the Anthropic Messages API.
 * Throws on network error or non-2xx response.
 */
export async function callClaude(
  apiKey: string,
  options: ClaudeOptions,
): Promise<ClaudeResponse> {
  const {
    model = 'claude-haiku-4-5',
    system,
    messages,
    max_tokens = 1024,
    temperature = 0.3,
  } = options;

  const body: Record<string, unknown> = {
    model,
    max_tokens,
    temperature,
    messages,
  };

  if (system) {
    body.system = system;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown error');
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? '';
  const usage = data.usage ?? {};

  return {
    text,
    model: data.model ?? model,
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
  };
}

/**
 * Call Claude and parse the response as JSON.
 * Retries once if JSON parsing fails.
 */
export async function callClaudeJSON<T = Record<string, unknown>>(
  apiKey: string,
  options: ClaudeOptions,
): Promise<T> {
  const response = await callClaude(apiKey, options);

  // Claude sometimes wraps JSON in markdown code blocks
  let text = response.text.trim();
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    text = jsonMatch[1].trim();
  }

  // Find the first { or [ and parse from there
  const jsonStart = text.search(/[{[]/);
  if (jsonStart > 0) {
    text = text.substring(jsonStart);
  }

  return JSON.parse(text) as T;
}
