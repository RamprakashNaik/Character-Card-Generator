import { create } from 'zustand';
import { AISettings, AIProviderPreset, DEFAULT_PRESETS, ModelOption } from '../types/ai';

interface SettingsState {
  settings: AISettings;
  availableModels: ModelOption[];
  isLoadingModels: boolean;
  modelFetchError: string | null;
  setProvider: (provider: AIProviderPreset) => void;
  updateSettings: (updates: Partial<AISettings>) => void;
  setAvailableModels: (models: ModelOption[]) => void;
  setIsLoadingModels: (loading: boolean) => void;
  setModelFetchError: (error: string | null) => void;
}

const STORAGE_KEY = 'sillytavern_card_generator_settings';

function loadInitialSettings(): AISettings {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        provider: parsed.provider || 'openrouter',
        baseUrl: parsed.baseUrl || DEFAULT_PRESETS.openrouter.baseUrl,
        apiKey: parsed.apiKey || '',
        model: parsed.model || DEFAULT_PRESETS.openrouter.defaultModel,
        temperature: parsed.temperature ?? 0.7,
        maxTokens: parsed.maxTokens || 4096,
      };
    } catch {}
  }

  // Default to OpenRouter
  return {
    provider: 'openrouter',
    baseUrl: DEFAULT_PRESETS.openrouter.baseUrl,
    apiKey: '',
    model: DEFAULT_PRESETS.openrouter.defaultModel,
    temperature: 0.7,
    maxTokens: 4096,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadInitialSettings(),
  availableModels: [],
  isLoadingModels: false,
  modelFetchError: null,

  setProvider: (provider: AIProviderPreset) => {
    const preset = DEFAULT_PRESETS[provider];
    const newSettings: AISettings = {
      ...get().settings,
      provider,
      baseUrl: preset.baseUrl,
      model: preset.defaultModel,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    set({ settings: newSettings, modelFetchError: null });
  },

  updateSettings: (updates: Partial<AISettings>) => {
    const newSettings = { ...get().settings, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    set({ settings: newSettings });
  },

  setAvailableModels: (models: ModelOption[]) => set({ availableModels: models }),
  setIsLoadingModels: (loading: boolean) => set({ isLoadingModels: loading }),
  setModelFetchError: (error: string | null) => set({ modelFetchError: error }),
}));
