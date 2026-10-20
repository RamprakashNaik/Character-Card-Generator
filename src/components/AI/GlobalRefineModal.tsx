import React, { useState, useEffect } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { streamChatCompletion } from '../../services/aiClient';
import { SYSTEM_ROLE_ARCHITECT, buildGlobalRefinePrompt } from '../../services/prompts';
import { GranularCharacterProfile } from '../../types/sillytavern';
import {
  Wand2,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronRight,
  Layers,
  FileDiff,
  HelpCircle,
} from 'lucide-react';

interface GlobalRefineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_INSPIRATION_PRESETS = [
  {
    label: 'Darker & Grittier',
    instruction: 'Shift the overall tone to be darker, more dangerous, and psychologically intense. Deepen their past scars and make the atmosphere weathered and tense.',
  },
  {
    label: 'Tactical Combat Wardrobe',
    instruction: 'Upgrade their wardrobe and gear to practical, tactical adventuring clothes with reinforced armor plates, utility pouches, concealed blades, and travel cloaks.',
  },
  {
    label: 'Witty & Sarcastic Voice',
    instruction: 'Make speech mannerisms and example dialogues snappy, dry-witted, and laced with sharp sarcastic humor without losing their genuine competence.',
  },
  {
    label: 'Literary Sensory Immersion',
    instruction: 'Elevate prose quality in the opening message and scenario with rich sensory details—ambient lighting, weather, scents, fabric textures, and subtle micro-expressions.',
  },
  {
    label: 'Emotional Vulnerability',
    instruction: 'Add deeper emotional stakes, hidden regrets, and vulnerable traits beneath their tough exterior, making them more relatable in roleplay.',
  },
  {
    label: '🇮🇳 100% Hinglish Voice & Storytelling',
    instruction: 'Rewrite the first message and all example dialogues in 100% natural conversational Hinglish using Roman/Latin alphabet. Ensure BOTH spoken dialogue and narrative descriptive actions stay strictly in authentic Hinglish without reverting to English.',
  },
  {
    label: '🇮🇳 Hinglish Dialogue Only',
    instruction: 'Change all spoken dialogue quotes to natural conversational Hinglish (Roman script), while keeping third-person narrative actions in English.',
  },
  {
    label: 'High-Stakes Ambush Scenario',
    instruction: 'Rework the opening scenario and first message to start in the middle of a tense ambush or rain-slicked confrontation where {{char}} and {{user}} must react immediately.',
  },
];

const AVAILABLE_SECTIONS: Array<{ key: keyof GranularCharacterProfile; label: string }> = [
  { key: 'identity', label: 'Identity & Archetype' },
  { key: 'appearance', label: 'Physical Appearance' },
  { key: 'wardrobe', label: 'Wardrobe & Gear' },
  { key: 'personality', label: 'Personality & Voice' },
  { key: 'background', label: 'Background & Lore' },
  { key: 'scenario', label: 'Scenario & First Message' },
  { key: 'dialogues', label: 'Example Dialogues' },
  { key: 'guardrails', label: 'Narration & Directives' },
  { key: 'lorebook', label: 'Lorebook & World Info' },
];

export const GlobalRefineModal: React.FC<GlobalRefineModalProps> = ({ isOpen, onClose }) => {
  const { profile, applyPartialUpdates } = useCardStore();
  const { settings } = useSettingsStore();

  const [instruction, setInstruction] = useState('');
  const [useCustomScope, setUseCustomScope] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Results State
  const [changeSummary, setChangeSummary] = useState<string[]>([]);
  const [modifiedSections, setModifiedSections] = useState<string[]>([]);
  const [parsedUpdates, setParsedUpdates] = useState<Partial<GranularCharacterProfile> | null>(null);
  const [sectionsToApply, setSectionsToApply] = useState<Record<string, boolean>>({});
  const [activeDiffTab, setActiveDiffTab] = useState<string>('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Reset completion state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setAppliedSuccess(false);
      setParsedUpdates(null);
      setChangeSummary([]);
      setModifiedSections([]);
      setError(null);
      setIsGenerating(false);
      setGenerationStep('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setAppliedSuccess(false);
    setParsedUpdates(null);
    onClose();
  };

  if (!isOpen) return null;

  const toggleSectionScope = (sectionKey: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionKey) ? prev.filter(k => k !== sectionKey) : [...prev, sectionKey]
    );
  };

  const handleRefine = async () => {
    if (!instruction.trim()) {
      setError('Please describe what improvements or changes you want the AI to make.');
      return;
    }

    if (!settings.baseUrl) {
      setError('AI Base URL is not configured. Please open Settings.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationStep('Analyzing character card and your directives...');
    setChangeSummary([]);
    setModifiedSections([]);
    setParsedUpdates(null);
    setAppliedSuccess(false);

    const prompt = buildGlobalRefinePrompt({
      profile,
      instruction: instruction.trim(),
      selectedSections: useCustomScope && selectedSections.length > 0 ? selectedSections : undefined,
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
          if (accumulated.includes('"changeSummary"') && !accumulated.includes('"updates"')) {
            setGenerationStep('Planning multi-section revisions...');
          } else if (accumulated.includes('"updates"')) {
            setGenerationStep('Crafting updated character sections...');
          }
        }
      );

      setGenerationStep('Validating JSON updates...');

      let jsonStr = accumulated.trim();
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];

      const parsed = JSON.parse(jsonStr);

      const summary: string[] = Array.isArray(parsed.changeSummary) ? parsed.changeSummary : [];
      const updates: Partial<GranularCharacterProfile> = parsed.updates || {};
      const modified: string[] =
        Array.isArray(parsed.modifiedSections) && parsed.modifiedSections.length > 0
          ? parsed.modifiedSections
          : Object.keys(updates);

      if (Object.keys(updates).length === 0) {
        throw new Error('AI returned no section updates. Please provide more detailed instructions.');
      }

      setChangeSummary(summary);
      setModifiedSections(modified);
      setParsedUpdates(updates);

      // Default all modified sections to selected for apply
      const initialApplyMap: Record<string, boolean> = {};
      modified.forEach(k => {
        initialApplyMap[k] = true;
      });
      setSectionsToApply(initialApplyMap);
      if (modified.length > 0) {
        setActiveDiffTab(modified[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to refine character');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleApply = () => {
    if (!parsedUpdates) return;

    // Filter updates according to checked sections
    const filteredUpdates: Partial<GranularCharacterProfile> = {};
    Object.keys(parsedUpdates).forEach(key => {
      const typedKey = key as keyof GranularCharacterProfile;
      if (sectionsToApply[key]) {
        (filteredUpdates as any)[typedKey] = parsedUpdates[typedKey];
      }
    });

    applyPartialUpdates(filteredUpdates);
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const renderSectionDiff = (sectionKey: string) => {
    if (!parsedUpdates) return null;
    const originalVal = (profile as any)[sectionKey];
    const updatedVal = (parsedUpdates as any)[sectionKey];

    if (!updatedVal) {
      return (
        <div className="p-4 text-xs text-slate-500 italic bg-slate-950/40 rounded-xl">
          No changes proposed for this section.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {Object.keys(updatedVal).map(fieldKey => {
          const originalField = originalVal ? originalVal[fieldKey] : '';
          const updatedField = updatedVal[fieldKey];

          // Check if field actually changed
          const isChanged = JSON.stringify(originalField) !== JSON.stringify(updatedField);
          if (!isChanged) return null;

          const formatContent = (val: any) => {
            if (Array.isArray(val)) return val.join(', ');
            if (typeof val === 'object' && val !== null) return JSON.stringify(val, null, 2);
            return String(val);
          };

          return (
            <div
              key={fieldKey}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
            >
              <div className="font-semibold text-indigo-300 capitalize flex items-center justify-between">
                <span>{fieldKey.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Modified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {/* Current */}
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-200/80">
                  <div className="text-[10px] font-bold uppercase text-rose-400 mb-1">Current</div>
                  <div className="max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-xs">
                    {formatContent(originalField) || <span className="italic opacity-50">(Empty)</span>}
                  </div>
                </div>

                {/* Proposed */}
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-200">
                  <div className="text-[10px] font-bold uppercase text-emerald-400 mb-1">
                    AI Improved
                  </div>
                  <div className="max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-xs">
                    {formatContent(updatedField)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[96vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Global AI Character Refiner
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Multi-Section
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Describe desired changes; AI intelligently updates all affected card sections
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {appliedSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-bounce">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Improvements Applied Successfully!</h3>
              <p className="text-xs text-slate-400">
                All selected sections have been updated. You can always use Undo (Ctrl+Z) if needed.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAppliedSuccess(false);
                    setParsedUpdates(null);
                    setChangeSummary([]);
                    setModifiedSections([]);
                    setInstruction('');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Refine Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : parsedUpdates ? (
            /* Review & Diff Screen */
            <div className="space-y-5">
              {/* Change Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-800/50 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AI Improvement Summary</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-200 pl-1">
                  {changeSummary.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section Diff Navigator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <FileDiff className="w-4 h-4 text-indigo-400" />
                    <span>Review Modified Sections ({modifiedSections.length})</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">Toggle checkboxes to include or omit</span>
                </div>

                {/* Section Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {modifiedSections.map(secKey => {
                    const sectionMeta = AVAILABLE_SECTIONS.find(s => s.key === secKey);
                    const isSelected = sectionsToApply[secKey] ?? true;
                    const isActive = activeDiffTab === secKey;

                    return (
                      <div
                        key={secKey}
                        onClick={() => setActiveDiffTab(secKey)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all shrink-0 ${
                          isActive
                            ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            e.stopPropagation();
                            setSectionsToApply(prev => ({ ...prev, [secKey]: !prev[secKey] }));
                          }}
                          className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                        />
                        <span>{sectionMeta?.label || secKey}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Diff Detail Panel */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-h-72 overflow-y-auto">
                  {renderSectionDiff(activeDiffTab)}
                </div>
              </div>
            </div>
          ) : (
            /* Prompt Input Screen */
            <div className="space-y-4">
              {/* Character Reference Pill */}
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Target Character:{' '}
                  <strong className="text-white font-bold">{profile.identity.name}</strong>
                  {profile.identity.archetype ? ` (${profile.identity.archetype})` : ''}
                </span>
                <span className="text-[11px] text-indigo-400 font-mono">
                  {profile.guardrails.narrationStyle} prose
                </span>
              </div>

              {/* Main Prompt Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Describe the improvements or changes you want:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Natural language</span>
                </label>
                <textarea
                  rows={4}
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  placeholder="e.g. Change her from a quiet librarian into an elusive underground informant. Update her wardrobe to dark hooded traveler garments with concealed throwing daggers, make the opening message tense when {{user}} corners her in a rainy alleyway, and add lorebook entries about the Black Market archive."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-xs sm:text-sm placeholder-slate-500 leading-relaxed transition-all resize-none"
                />
              </div>

              {/* Quick Inspiration Chips */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Improvement Directives
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_INSPIRATION_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInstruction(preset.instruction)}
                      className="text-left px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 hover:text-white text-xs transition-all"
                    >
                      <span className="font-semibold text-indigo-300">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Section Scope Toggle */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setUseCustomScope(!useCustomScope)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {useCustomScope
                      ? 'Custom Section Scope (Enabled)'
                      : 'Scope: Auto-detect all affected sections (Click to customize)'}
                  </span>
                  {useCustomScope ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>

                {useCustomScope && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {AVAILABLE_SECTIONS.map(sec => {
                      const isChecked = selectedSections.includes(sec.key);
                      return (
                        <label
                          key={sec.key}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer select-none text-slate-300"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSectionScope(sec.key)}
                            className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                          />
                          <span className="truncate">{sec.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Toolbar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
          {parsedUpdates ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setParsedUpdates(null);
                  setChangeSummary([]);
                  setModifiedSections([]);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Directives</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Selected Improvements</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-slate-400 truncate max-w-xs">
                {isGenerating ? (
                  <span className="flex items-center gap-2 text-indigo-300">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>{generationStep || 'Refining character card...'}</span>
                  </span>
                ) : (
                  <span>Ready to optimize with {settings.model || 'AI'}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRefine}
                  disabled={isGenerating || !instruction.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Refining Across Sections...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Refine Character</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
