import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { DEFAULT_PRESETS, AIProviderPreset } from '../types/ai';
import { fetchAvailableModels } from '../services/aiClient';
import {
  X,
  Server,
  Key,
  Cpu,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    setProvider,
    updateSettings,
    availableModels,
    setAvailableModels,
    isLoadingModels,
    setIsLoadingModels,
    modelFetchError,
    setModelFetchError,
  } = useSettingsStore();

  const [showKey, setShowKey] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFetchModels = async () => {
    setIsLoadingModels(true);
    setModelFetchError(null);
    setTestSuccess(false);

    try {
      const models = await fetchAvailableModels(settings);
      setAvailableModels(models);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (err: any) {
      setModelFetchError(err.message || 'Failed to connect to API');
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Connection Settings</h2>
              <p className="text-xs text-slate-400">OpenAI-compatible endpoint for card generation & testing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Provider Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(DEFAULT_PRESETS) as AIProviderPreset[]).map(key => {
                const preset = DEFAULT_PRESETS[key];
                const active = settings.provider === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProvider(key)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                      active
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-white truncate">{preset.name}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.defaultModel || 'Custom'}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {DEFAULT_PRESETS[settings.provider]?.note}
            </p>
          </div>

          {/* Endpoint Base URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              API Base URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings.baseUrl}
                onChange={e => updateSettings({ baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* CORS Proxy Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="cors-proxy-toggle"
              checked={settings.useProxy ?? false}
              onChange={e => updateSettings({ useProxy: e.target.checked })}
              className="mt-0.5 rounded accent-indigo-500 shrink-0"
            />
            <label htmlFor="cors-proxy-toggle" className="text-xs cursor-pointer">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Force Local CORS Proxy</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  Bypass Restrictions
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Routes all requests through Vite's built-in dev proxy. Useful if LM Studio or Ollama blocks direct browser requests. (Also auto-falls-back automatically on network errors).
              </div>
            </label>
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                API Key
              </label>
              <span className="text-[11px] text-slate-500">Stored locally in your browser</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={e => updateSettings({ apiKey: e.target.value })}
                placeholder={settings.provider === 'lmstudio' || settings.provider === 'ollama' ? 'Optional for local models' : 'sk-...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Selection & Auto-Discovery */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Model Name
              </label>
              <button
                type="button"
                onClick={handleFetchModels}
                disabled={isLoadingModels || !settings.baseUrl}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
                <span>{isLoadingModels ? 'Fetching...' : 'Fetch Models'}</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Cpu className="w-4 h-4" />
              </div>
              <input
                type="text"
                list="models-datalist"
                value={settings.model}
                onChange={e => updateSettings({ model: e.target.value })}
                placeholder="e.g. anthropic/claude-3.5-sonnet, gpt-4o-mini"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <datalist id="models-datalist">
                {availableModels.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.id}
                  </option>
                ))}
              </datalist>
            </div>

            {testSuccess && (
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Found {availableModels.length} models! Model list updated.</span>
              </div>
            )}

            {modelFetchError && (
              <div className="flex items-start gap-2 mt-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-rose-200">Connection Trouble</div>
                  <div className="text-rose-300/90 leading-relaxed">{modelFetchError}</div>
                  <div className="text-[11px] text-slate-300 mt-2 bg-slate-950/60 p-2 rounded-lg">
                    <strong>Quick Fix:</strong><br />
                    • <strong>LM Studio:</strong> In LM Studio, click <strong>Local Server</strong> tab, ensure the server is <strong>Running</strong>, and check <strong>Enable CORS</strong>.<br />
                    • <strong>Ollama:</strong> Run <code className="text-indigo-300 font-mono">$env:OLLAMA_ORIGINS="*" ; ollama serve</code> in PowerShell before connecting.<br />
                    • <strong>Auto Proxy:</strong> Check the <em>"Force Local CORS Proxy"</em> toggle above.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Parameters (Temperature & Max Tokens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Temperature
                </label>
                <span className="text-xs font-mono text-indigo-400">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={settings.temperature}
                onChange={e => updateSettings({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.1 (Precise)</span>
                <span>0.7 (Balanced)</span>
                <span>1.5 (Creative)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Max Response Tokens
                </label>
                <span className="text-xs font-mono text-indigo-400">{settings.maxTokens}</span>
              </div>
              <input
                type="number"
                min="512"
                max="8192"
                step="256"
                value={settings.maxTokens}
                onChange={e => updateSettings({ maxTokens: parseInt(e.target.value) || 4096 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 sticky bottom-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
