import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { streamChatCompletion } from '../../services/aiClient';
import {
  SYSTEM_ROLE_ARCHITECT,
  buildFullCardPrompt,
  buildDeduceContextPrompt,
} from '../../services/prompts';
import { GranularCharacterProfile } from '../../types/sillytavern';
import {
  Sparkles,
  X,
  AlertCircle,
  Flame,
  Loader2,
  Globe,
  Smile,
  Users,
  ChevronDown,
  ChevronUp,
  Wand2,
  Check,
} from 'lucide-react';

interface IdeaWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_IDEAS = [
  {
    title: 'Cynical Airship Captain',
    genre: 'Steampunk Fantasy',
    tone: 'Gritty & Wry',
    dynamic: 'Reluctant Allies',
    idea: 'A cynical airship captain with a mechanical eye who smuggles forbidden aether crystals across floating sky archipelagos, secretly searching for his lost crew.',
  },
  {
    title: 'Cyberpunk Bio-Hacker',
    genre: 'Cyberpunk Dystopia',
    tone: 'Dark & High Stakes',
    dynamic: 'Informant & Client',
    idea: 'A neon-drenched street bio-hacker who illegally modifies synthetic organs in the undercity sewers, pursued by megacorp assassins for stealing an AI core.',
  },
  {
    title: 'Tsundere Royal Inquisitor',
    genre: 'High Fantasy / Court Intrigue',
    tone: 'Dramatic & Sharp',
    dynamic: 'Rivalry / Captor and Captive',
    idea: 'A haughty high-elf inquisitor wielding solar magic who arrests {{user}} on suspicion of heresy, but secretly suspects her superiors are corrupted by shadow demons.',
  },
  {
    title: 'Sentient Android Butler',
    genre: 'Sci-Fi Gothic Mystery',
    tone: 'Polite & Eerie',
    dynamic: 'Master & Protector',
    idea: 'An antique humanoid android who serves as the estate steward on a remote terraforming colony, observing humans with polite fascination while hiding a glitching consciousness.',
  },
];

export const IdeaWizardModal: React.FC<IdeaWizardModalProps> = ({ isOpen, onClose }) => {
  const { setProfile } = useCardStore();
  const { settings } = useSettingsStore();

  const [baseIdea, setBaseIdea] = useState('');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [dynamic, setDynamic] = useState('');
  const [isDetectingContext, setIsDetectingContext] = useState(false);
  const [showManualOverride, setShowManualOverride] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [rawOutput, setRawOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (p: typeof PRESET_IDEAS[0]) => {
    setBaseIdea(p.idea);
    setGenre(p.genre);
    setTone(p.tone);
    setDynamic(p.dynamic);
  };

  // Automatically infer Setting, Tone, and Dynamic with {{user}} from the base idea
  const handleAutoDetectContext = async () => {
    if (!baseIdea.trim()) {
      setError('Please provide a character concept / base idea first.');
      return;
    }

    if (!settings.baseUrl) {
      setError('AI Base URL is not configured. Please open Settings.');
      return;
    }

    setIsDetectingContext(true);
    setError(null);

    const prompt = buildDeduceContextPrompt(baseIdea);
    let accumulated = '';

    try {
      await streamChatCompletion(
        settings,
        [
          { role: 'system', content: 'You are an expert story architect. Respond only with JSON.' },
          { role: 'user', content: prompt },
        ],
        chunk => {
          accumulated += chunk;
        }
      );

      let jsonStr = accumulated.trim();
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];

      const parsed = JSON.parse(jsonStr);
      if (parsed.genre) setGenre(parsed.genre);
      if (parsed.tone) setTone(parsed.tone);
      if (parsed.userDynamic) setDynamic(parsed.userDynamic);
    } catch (err: any) {
      console.warn('Auto-detect context error:', err);
    } finally {
      setIsDetectingContext(false);
    }
  };

  const handleGenerate = async () => {
    if (!baseIdea.trim()) {
      setError('Please provide a base character idea or select an inspiration preset.');
      return;
    }

    if (!settings.baseUrl) {
      setError('AI Base URL is not configured. Please open Settings.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRawOutput('');
    setGenerationStep('Initiating World & Character Architect...');

    const prompt = buildFullCardPrompt({
      baseIdea,
      genre: genre || undefined,
      tone: tone || undefined,
      userDynamic: dynamic || undefined,
    });

    let accumulated = '';

    try {
      setGenerationStep('Auto-generating Setting, Tone & Visual Appearance...');

      await streamChatCompletion(
        settings,
        [
          { role: 'system', content: SYSTEM_ROLE_ARCHITECT },
          { role: 'user', content: prompt },
        ],
        chunk => {
          accumulated += chunk;
          setRawOutput(accumulated);

          if (accumulated.includes('"wardrobe"') && !accumulated.includes('"personality"')) {
            setGenerationStep('Crafting Wardrobe, Gear & Footwear...');
          } else if (accumulated.includes('"personality"') && !accumulated.includes('"scenario"')) {
            setGenerationStep('Fleshing out Psychology, Voice & Quirks...');
          } else if (accumulated.includes('"scenario"') && !accumulated.includes('"dialogues"')) {
            setGenerationStep('Drafting Scenario & Sensory Opening Greeting...');
          } else if (accumulated.includes('"dialogues"') && !accumulated.includes('"lorebook"')) {
            setGenerationStep('Writing Multi-Scenario <START> Voice Dialogues...');
          } else if (accumulated.includes('"lorebook"')) {
            setGenerationStep('Generating Interconnected World Info & Lorebook...');
          }
        }
      );

      setGenerationStep('Validating SillyTavern V2 Schema...');

      // Parse JSON from output
      let jsonStr = accumulated.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr);

      // Collect inferred context
      const inferredGenre = parsed.inferredContext?.genre || genre || 'Original';
      const inferredTone = parsed.inferredContext?.tone || tone || 'Immersive';
      const inferredDynamic = parsed.inferredContext?.userDynamic || dynamic || 'Stranger';

      // Create full granular profile
      const newProfile: GranularCharacterProfile = {
        identity: {
          name: parsed.identity?.name || 'Unnamed Character',
          nickname: parsed.identity?.nickname || '',
          age: parsed.identity?.age || '25',
          gender: parsed.identity?.gender || 'Unknown',
          species: parsed.identity?.species || 'Human',
          archetype: parsed.identity?.archetype || 'Adventurer',
          creator: '',
          version: '1.0',
          tags: Array.isArray(parsed.identity?.tags)
            ? Array.from(new Set([...parsed.identity.tags, inferredGenre, inferredTone]))
            : ['Original', inferredGenre, inferredTone],
          avatarUrl: '',
        },
        appearance: {
          heightAndBuild: parsed.appearance?.heightAndBuild || '',
          faceAndEyes: parsed.appearance?.faceAndEyes || '',
          hair: parsed.appearance?.hair || '',
          complexion: parsed.appearance?.complexion || '',
          distinctiveMarks: parsed.appearance?.distinctiveMarks || '',
          generalImpressions: parsed.appearance?.generalImpressions || '',
        },
        wardrobe: {
          signatureOutfit: parsed.wardrobe?.signatureOutfit || '',
          footwear: parsed.wardrobe?.footwear || '',
          accessoriesAndJewelry: parsed.wardrobe?.accessoriesAndJewelry || '',
          equipmentAndWeapons: parsed.wardrobe?.equipmentAndWeapons || '',
          alternateOutfits: parsed.wardrobe?.alternateOutfits || '',
        },
        personality: {
          coreTraits: Array.isArray(parsed.personality?.coreTraits) ? parsed.personality.coreTraits : ['Complex'],
          psychologicalProfile: parsed.personality?.psychologicalProfile || '',
          likes: Array.isArray(parsed.personality?.likes) ? parsed.personality.likes : [],
          dislikes: Array.isArray(parsed.personality?.dislikes) ? parsed.personality.dislikes : [],
          quirksAndHabits: Array.isArray(parsed.personality?.quirksAndHabits) ? parsed.personality.quirksAndHabits : [],
          speechMannerisms: parsed.personality?.speechMannerisms || '',
        },
        background: {
          backstory: parsed.background?.backstory || '',
          currentOccupation: parsed.background?.currentOccupation || '',
          motivations: parsed.background?.motivations || '',
          secrets: parsed.background?.secrets || '',
          dynamicWithUser: parsed.background?.dynamicWithUser || inferredDynamic,
        },
        scenario: {
          environmentAndContext: parsed.scenario?.environmentAndContext || '',
          firstMessage: parsed.scenario?.firstMessage || '',
          alternateGreetings: Array.isArray(parsed.scenario?.alternateGreetings)
            ? parsed.scenario.alternateGreetings
            : [],
        },
        dialogues: {
          casual: parsed.dialogues?.casual || '',
          conflict: parsed.dialogues?.conflict || '',
          vulnerable: parsed.dialogues?.vulnerable || '',
          customExamples: '',
        },
        lorebook: Array.isArray(parsed.lorebook)
          ? parsed.lorebook.map((entry: any, idx: number) => ({
              id: idx + 1,
              comment: entry.comment || `World Entry #${idx + 1}`,
              keys: Array.isArray(entry.keys) ? entry.keys : ['Lore'],
              secondary_keys: Array.isArray(entry.secondary_keys) ? entry.secondary_keys : [],
              content: entry.content || '',
              insertion_order: (idx + 1) * 10,
              enabled: true,
              position: 'before_char',
            }))
          : [],
        guardrails: {
          preventUserImpersonation: true,
          immersiveProseStyle: true,
          pastTenseNarration: true,
          customSystemPrompt: '',
          postHistoryInstructions: '',
          creatorNotes: `Generated from idea: "${baseIdea}" | Setting: ${inferredGenre} | Tone: ${inferredTone}`,
        },
      };

      setProfile(newProfile);
      setIsGenerating(false);
      onClose();
    } catch (err: any) {
      console.error('Generation parse error:', err);
      setError(`Failed to generate full card: ${err.message}. Check your API connection or try again.`);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Idea to Character & World
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Co-Pilot
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Just provide your base idea — AI automatically derives the setting, tone, wardrobe, and lorebook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Presets for inspiration */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Or Pick an Inspiration Starter</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_IDEAS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  disabled={isGenerating}
                  className="text-left p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="font-semibold text-xs text-indigo-300 group-hover:text-indigo-200">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {p.idea}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Base Concept Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Your Character Concept / Base Idea *
              </label>
              {baseIdea.trim() && (
                <button
                  type="button"
                  onClick={handleAutoDetectContext}
                  disabled={isDetectingContext || isGenerating}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-40"
                >
                  {isDetectingContext ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isDetectingContext ? 'Deducing...' : 'Auto-Detect Context'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={4}
              value={baseIdea}
              onChange={e => setBaseIdea(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. A cynical airship captain with a mechanical eye who smuggles forbidden aether crystals across floating sky archipelagos, secretly searching for his lost crew..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* AI Auto-Generated Context Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  AI Context Generation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  Auto-Inferred
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowManualOverride(!showManualOverride)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span>{showManualOverride ? 'Hide Options' : 'Edit Manually (Optional)'}</span>
                {showManualOverride ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Inferred Context Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Setting / Genre */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Globe className="w-3 h-3 text-indigo-400" />
                  <span>Setting & Genre</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                  {genre || (
                    <span className="text-slate-500 italic font-normal">
                      Auto-detected by AI
                    </span>
                  )}
                </div>
              </div>

              {/* Tone / Mood */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Smile className="w-3 h-3 text-purple-400" />
                  <span>Tone & Mood</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                  {tone || (
                    <span className="text-slate-500 italic font-normal">
                      Auto-detected by AI
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic with {{user}} */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Users className="w-3 h-3 text-cyan-400" />
                  <span>Dynamic with {'{{user}}'}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                  {dynamic || (
                    <span className="text-slate-500 italic font-normal">
                      Auto-detected by AI
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Manual Override Inputs (Only shown if toggled) */}
            {showManualOverride && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Override Setting / Genre
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    disabled={isGenerating}
                    placeholder="e.g. Steampunk Fantasy"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Override Tone / Mood
                  </label>
                  <input
                    type="text"
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    disabled={isGenerating}
                    placeholder="e.g. Gritty & Wry"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Override Dynamic with {'{{user}}'}
                  </label>
                  <input
                    type="text"
                    value={dynamic}
                    onChange={e => setDynamic(e.target.value)}
                    disabled={isGenerating}
                    placeholder="e.g. Reluctant Allies"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generation Progress Display */}
          {isGenerating && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                <div className="text-xs font-semibold text-indigo-200">
                  {generationStep}
                </div>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full w-full animate-pulse" />
              </div>
              {rawOutput && (
                <div className="text-[10px] text-slate-400 font-mono max-h-24 overflow-hidden line-clamp-3 bg-slate-950/60 p-2 rounded-lg">
                  {rawOutput}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            Connected Model: <span className="text-slate-300 font-mono">{settings.model}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !baseIdea.trim()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing World & Character...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Card</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
