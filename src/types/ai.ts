export type AIProviderPreset = 'openrouter' | 'openai' | 'groq' | 'lmstudio' | 'ollama' | 'custom';

export interface AISettings {
  provider: AIProviderPreset;
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  useProxy?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ModelOption {
  id: string;
  name: string;
}

export const DEFAULT_PRESETS: Record<AIProviderPreset, { name: string; baseUrl: string; defaultModel: string; note: string }> = {
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    note: 'Best overall quality for roleplay & card authoring.',
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    note: 'Official OpenAI API.',
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    note: 'Ultra fast responses & generous free tier.',
  },
  lmstudio: {
    name: 'LM Studio (Local)',
    baseUrl: 'http://localhost:1234/v1',
    defaultModel: 'local-model',
    note: 'Built-in auto-proxy bypasses CORS automatically.',
  },
  ollama: {
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3:8b',
    note: 'Built-in auto-proxy bypasses CORS automatically.',
  },
  custom: {
    name: 'Custom OpenAI-Compatible',
    baseUrl: '',
    defaultModel: '',
    note: 'Any OpenAI API compatible server.',
  },
};
