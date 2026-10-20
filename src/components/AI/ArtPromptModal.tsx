import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { streamChatCompletion } from '../../services/aiClient';
import { buildArtPromptGeneration } from '../../services/prompts';
import {
  Image as ImageIcon,
  X,
  Copy,
  Check,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface ArtPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArtPromptModal: React.FC<ArtPromptModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useCardStore();
  const { settings } = useSettingsStore();

  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(
    'worst quality, low quality, bad anatomy, bad hands, missing fingers, extra digits, blurry, mutated, watermark, signature'
  );
  const [midjourneyPrompt, setMidjourneyPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGeneratePrompts = async () => {
    setIsGenerating(true);
    const prompt = buildArtPromptGeneration(profile);

    let accumulated = '';
    try {
      await streamChatCompletion(
        settings,
        [{ role: 'user', content: prompt }],
        chunk => {
          accumulated += chunk;
        }
      );

      let jsonStr = accumulated.trim();
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];

      const parsed = JSON.parse(jsonStr);
      if (parsed.positivePrompt) setPositivePrompt(parsed.positivePrompt);
      if (parsed.negativePrompt) setNegativePrompt(parsed.negativePrompt);
      if (parsed.midjourneyPrompt) setMidjourneyPrompt(parsed.midjourneyPrompt);
    } catch {
      // Fallback generator from profile fields directly
      const fallbackPos = `masterpiece, best quality, 1${profile.identity.gender.toLowerCase().includes('female') ? 'girl' : 'boy'}, ${profile.identity.name}, ${profile.identity.archetype}, ${profile.appearance.hair}, ${profile.appearance.faceAndEyes}, ${profile.wardrobe.signatureOutfit}, cinematic lighting, detailed face, 8k portrait`;
      setPositivePrompt(fallbackPos);
      setMidjourneyPrompt(`/imagine prompt: cinematic portrait of ${profile.identity.name}, ${profile.identity.archetype}, ${profile.appearance.hair}, ${profile.appearance.faceAndEyes}, ${profile.wardrobe.signatureOutfit}, volumetric lighting, 8k --ar 1:1 --v 6.0`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Avatar Art Prompt Generator
              </h2>
              <p className="text-xs text-slate-400">
                Transforms appearance & wardrobe into optimized prompts for Stable Diffusion & Midjourney
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {(!positivePrompt && !isGenerating) && (
            <div className="text-center py-6 px-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-semibold text-white">Generate Image Prompts</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Extract details from {profile.identity.name}'s physical appearance, clothing, and accessories to create art prompts.
              </p>
              <button
                type="button"
                onClick={handleGeneratePrompts}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-pink-600/30 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build Visual Art Prompts</span>
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              <div className="text-xs font-semibold text-slate-300">
                Extracting visual keywords & constructing art prompt...
              </div>
            </div>
          )}

          {(positivePrompt && !isGenerating) && (
            <div className="space-y-4">
              {/* Positive Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Stable Diffusion / NovelAI Prompt
                  </label>
                  <button
                    onClick={() => handleCopy(positivePrompt, 'pos')}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedKey === 'pos' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'pos' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={positivePrompt}
                  onChange={e => setPositivePrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Midjourney Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Midjourney Prompt
                  </label>
                  <button
                    onClick={() => handleCopy(midjourneyPrompt, 'mj')}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedKey === 'mj' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'mj' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={midjourneyPrompt}
                  onChange={e => setMidjourneyPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Negative Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Negative Prompt
                  </label>
                  <button
                    onClick={() => handleCopy(negativePrompt, 'neg')}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedKey === 'neg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'neg' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={negativePrompt}
                  onChange={e => setNegativePrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-400 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGeneratePrompts}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Regenerate Prompts</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
