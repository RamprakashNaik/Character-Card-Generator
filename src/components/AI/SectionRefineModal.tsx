import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { streamChatCompletion } from '../../services/aiClient';
import { SYSTEM_ROLE_ARCHITECT, buildSectionRefinePrompt } from '../../services/prompts';
import {
  Wand2,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface SectionRefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  currentContent: string;
  onApply: (updatedContent: string) => void;
}

const QUICK_MODIFIERS = [
  'Add rich sensory details (lighting, materials, micro-expressions)',
  'Make more concise without losing core traits',
  'Make darker, more weathered and gritty',
  'Increase emotional depth and vulnerability',
  'Make speech more dry, witty and sarcastic',
  'Add combat gear, weapons and practical travel layers',
];

export const SectionRefineModal: React.FC<SectionRefineModalProps> = ({
  isOpen,
  onClose,
  sectionTitle,
  currentContent,
  onApply,
}) => {
  const { profile } = useCardStore();
  const { settings } = useSettingsStore();

  const [userInstruction, setUserInstruction] = useState('');
  const [refinedText, setRefinedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefine = async (customInstruction?: string) => {
    const instruction = customInstruction || userInstruction;
    if (!instruction.trim()) {
      setError('Please enter your preference or pick a quick modifier.');
      return;
    }

    if (!settings.baseUrl) {
      setError('AI Base URL is not configured. Please open Settings.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRefinedText('');

    const prompt = buildSectionRefinePrompt({
      characterName: profile.identity.name,
      characterArchetype: profile.identity.archetype,
      sectionTitle,
      currentContent,
      userInstruction: instruction,
      languageDialect: profile.guardrails.languageDialect,
      povPerspective: profile.guardrails.povPerspective,
      gender: profile.identity.gender,
    });

    let accumulated = '';

    try {
      await streamChatCompletion(
        settings,
        [
          { role: 'system', content: SYSTEM_ROLE_ARCHITECT },
          { role: 'user', content: prompt },
        ],
        chunk => {
          accumulated += chunk;
          setRefinedText(accumulated);
        }
      );
      setIsGenerating(false);
    } catch (err: any) {
      setError(err.message || 'Failed to refine section');
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (refinedText.trim()) {
      onApply(refinedText.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Refine with AI: <span className="text-indigo-400">{sectionTitle}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Adjust this section as per your preference while preserving character consistency
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* User Instruction Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              How would you like to improve or change this?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userInstruction}
                onChange={e => setUserInstruction(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRefine()}
                placeholder="e.g. Make the outfit darker with worn leather and brass gears..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleRefine()}
                disabled={isGenerating || !userInstruction.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors shrink-0"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Refine</span>
              </button>
            </div>
          </div>

          {/* Quick Modifier Chips */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Or Click a Preset Refinement:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_MODIFIERS.map((mod, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUserInstruction(mod);
                    handleRefine(mod);
                  }}
                  disabled={isGenerating}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Comparison View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Current Version
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-h-48 sm:max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
                {currentContent || '<Empty>'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>AI Refined Version</span>
                {isGenerating && <span className="text-[10px] text-indigo-400 animate-pulse">Streaming...</span>}
              </div>
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-100 max-h-48 sm:max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
                {refinedText || (
                  <span className="text-slate-500 italic">
                    {isGenerating ? 'Drafting adjustment...' : 'The refined version will appear here.'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!refinedText.trim() || isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all disabled:opacity-40 shadow-lg shadow-indigo-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Apply to Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
