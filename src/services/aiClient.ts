/**
 * OpenAI-Compatible API Client supporting Streaming, Model Fetching,
 * and robust error handling for OpenRouter, Groq, LM Studio, Ollama, etc.
 * Features automatic fallback to local Vite CORS proxy to bypass browser restrictions.
 */

import { AISettings, ChatMessage, ModelOption } from '../types/ai';

export class AIClientError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AIClientError';
    this.status = status;
  }
}

/**
 * Normalizes baseUrl to ensure no trailing slash and proper /v1 suffix
 */
export function normalizeBaseUrl(url: string): string {
  let cleaned = url.trim().replace(/\/+$/, '');
  return cleaned;
}

/**
 * Executes a fetch request with automatic fallback to CORS proxy
 */
async function fetchWithCorsFallback(
  targetUrl: string,
  options: RequestInit,
  forceProxy: boolean = false
): Promise<Response> {
  const isCloudOllama = targetUrl.includes('ollama.com');
  const shouldUseProxy = forceProxy || isCloudOllama;

  const doProxyFetch = async () => {
    const proxyHeaders = new Headers(options.headers || {});
    proxyHeaders.set('x-target-url', targetUrl);
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    return fetch(proxyUrl, {
      ...options,
      headers: proxyHeaders,
    });
  };

  if (shouldUseProxy) {
    return doProxyFetch();
  }

  try {
    const res = await fetch(targetUrl, options);
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;

    // Automatic fallback: If browser blocked due to CORS or network security (TypeError)
    if (err.name === 'TypeError') {
      try {
        return await doProxyFetch();
      } catch (proxyErr: any) {
        if (proxyErr.name === 'AbortError') throw proxyErr;
        throw new AIClientError(
          `Unable to connect to ${targetUrl}. If using a local server, ensure CORS is enabled. If using Ollama Cloud, ensure the proxy is deployed.`
        );
      }
    }

    throw err;
  }
}

/**
 * Fetches available models from the /models endpoint
 */
export async function fetchAvailableModels(settings: AISettings): Promise<ModelOption[]> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl);
  if (!baseUrl) {
    throw new AIClientError('Base URL is required to fetch models');
  }

  const endpoint = `${baseUrl}/models`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (settings.apiKey) {
    headers['Authorization'] = `Bearer ${settings.apiKey.trim()}`;
  }

  try {
    const res = await fetchWithCorsFallback(
      endpoint,
      { method: 'GET', headers },
      settings.useProxy ?? false
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new AIClientError(
        `Failed to fetch models (${res.status}): ${errText || res.statusText}`,
        res.status
      );
    }

    const data = await res.json();
    const modelList = data.data || data.models || data;

    if (Array.isArray(modelList)) {
      return modelList.map((m: any) => ({
        id: m.id || m.name,
        name: m.name || m.id,
      }));
    }

    return [];
  } catch (err: any) {
    if (err instanceof AIClientError) throw err;
    throw new AIClientError(`Unable to reach endpoint: ${err.message}`);
  }
}

/**
 * Sends a chat completion request with real-time SSE streaming
 */
export async function streamChatCompletion(
  settings: AISettings,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl);
  if (!baseUrl) {
    throw new AIClientError('Base URL is not configured. Please open Settings.');
  }

  const endpoint = `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (settings.apiKey) {
    headers['Authorization'] = `Bearer ${settings.apiKey.trim()}`;
  }

  // OpenRouter requires HTTP-Referer and X-Title for rankings
  if (baseUrl.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'SillyTavern Character Card Studio';
  }

  const body = {
    model: settings.model || 'gpt-4o-mini',
    messages,
    temperature: settings.temperature ?? 0.7,
    max_tokens: settings.maxTokens || 4096,
    stream: true,
  };

  let response: Response;
  try {
    response = await fetchWithCorsFallback(
      endpoint,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal,
      },
      settings.useProxy ?? false
    );
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    if (err instanceof AIClientError) throw err;
    throw new AIClientError(`Connection failed: ${err.message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    let parsedMessage = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.error?.message) parsedMessage = parsed.error.message;
    } catch {}
    throw new AIClientError(`API Error (${response.status}): ${parsedMessage}`, response.status);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new AIClientError('Response body stream is not available');
  }

  const decoder = new TextDecoder('utf-8');
  let accumulatedText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') break;

          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              accumulatedText += delta;
              onChunk(delta);
            }
          } catch {}
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return accumulatedText;
}

/**
 * Non-streaming chat completion fallback
 */
export async function getChatCompletion(
  settings: AISettings,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  let fullText = '';
  await streamChatCompletion(settings, messages, chunk => {
    fullText += chunk;
  });
  return fullText;
}
