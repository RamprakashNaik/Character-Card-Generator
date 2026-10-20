import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { streamChatCompletion } from '../../services/aiClient';
import { buildHarmonizeDialoguesPrompt } from '../../services/prompts';
import {
  MessageSquare,
  Sparkles,
  Plus,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Feather,
  Compass,
  Loader2,
  Clock,
  Wand2,
} from 'lucide-react';
import { SectionRefineModal } from '../AI/SectionRefineModal';

export const DialogueTab: React.FC = () => {
  const { profile, updateScenario, updateDialogues, updateGuardrails } = useCardStore();
  const { settings } = useSettingsStore();
  const { scenario, dialogues, guardrails } = profile;

  const [activeRefineField, setActiveRefineField] = useState<{
    title: string;
    content: string;
    apply: (text: string) => void;
  } | null>(null);

  const [isHarmonizing, setIsHarmonizing] = useState(false);
  const [harmonizeNotice, setHarmonizeNotice] = useState<string | null>(null);

  // Check user impersonation in first message
  const userImpersonationPatterns = [
    /you feel\b/i,
    /you say\b/i,
    /you think\b/i,
    /you nod\b/i,
    /you walk\b/i,
    /you look\b/i,
    /\{\{user\}\} (?:feels?|says?|thinks?|nods?|walks?|replies?|gasps?)\b/i,
  ];
  const hasRailroading = userImpersonationPatterns.some(p => p.test(scenario.firstMessage));

  const handleAddGreeting = () => {
    updateScenario({
      alternateGreetings: [...scenario.alternateGreetings, ''],
    });
  };

  const handleUpdateGreeting = (index: number, text: string) => {
    const updated = [...scenario.alternateGreetings];
    updated[index] = text;
    updateScenario({ alternateGreetings: updated });
  };

  const handleRemoveGreeting = (index: number) => {
    const updated = scenario.alternateGreetings.filter((_, i) => i !== index);
    updateScenario({ alternateGreetings: updated });
  };

  // Harmonizes first message and all example dialogues with the chosen narration style
  const handleHarmonizeWithNarrationStyle = async () => {
    if (!settings.baseUrl) {
      alert('AI Base URL is not configured. Please open Settings.');
      return;
    }

    setIsHarmonizing(true);
    setHarmonizeNotice('Adapting opening scene and dialogues to match your narration style...');

    const prompt = buildHarmonizeDialoguesPrompt(profile);
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

      if (parsed.firstMessage) {
        updateScenario({ firstMessage: parsed.firstMessage });
      }

      updateDialogues({
        casual: parsed.casual || dialogues.casual,
        conflict: parsed.conflict || dialogues.conflict,
        vulnerable: parsed.vulnerable || dialogues.vulnerable,
      });

      setHarmonizeNotice('✔ Successfully harmonized greetings & dialogues with narration style!');
      setTimeout(() => setHarmonizeNotice(null), 4000);
    } catch (err: any) {
      alert(`Failed to harmonize dialogues: ${err.message}`);
    } finally {
      setIsHarmonizing(false);
    }
  };

  const narrationStyleTitle = {
    literary: 'Atmospheric Literary',
    cinematic: 'Cinematic Action',
    visceral: 'Visceral Tension',
    conversational: 'Dialogue-Focused Banter',
  }[guardrails.narrationStyle] || 'Atmospheric Literary';

  const povLabel = guardrails.povPerspective === 'first_person' ? '1st-Person (I)' : '3rd-Person ({{char}})';

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Dialogue, Greetings & Opening Scene
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            The primary voice engine in SillyTavern: opening scenes and multi-turn roleplay examples
          </p>
        </div>
      </div>

      {/* Narration Voice & Alignment Banner */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Active Narration Voice:
            </span>
            <span className="text-xs font-bold text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              {narrationStyleTitle}
            </span>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => updateGuardrails({ languageDialect: 'english' })}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                  guardrails.languageDialect !== 'hinglish'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => updateGuardrails({ languageDialect: 'hinglish' })}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                  guardrails.languageDialect === 'hinglish'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Strictly format First Message and dialogues in Hinglish (Roman script)"
              >
                Hinglish
              </button>
            </div>

            {/* Quick Perspective Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => updateGuardrails({ povPerspective: 'first_person' })}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                  guardrails.povPerspective === 'first_person'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Narrate in First-Person: 'Main / Mera / Mujhe / I'"
              >
                1st-Person (Main)
              </button>
              <button
                type="button"
                onClick={() => updateGuardrails({ povPerspective: 'third_person' })}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                  guardrails.povPerspective !== 'first_person'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Narrate in Third-Person: '{{char}} / Wo / He / She'"
              >
                3rd-Person (Wo)
              </button>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
            <span>Perspective: <strong className="text-slate-300">{povLabel}</strong></span>
            <span>•</span>
            <span>Pacing: <strong className="text-slate-300">{guardrails.pacingRule}</strong></span>
            {guardrails.storyGoalAndDirection && (
              <>
                <span>•</span>
                <span className="truncate max-w-[200px] text-amber-300/80">Goal: {guardrails.storyGoalAndDirection}</span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleHarmonizeWithNarrationStyle}
          disabled={isHarmonizing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all shrink-0 disabled:opacity-50"
        >
          {isHarmonizing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          <span>{isHarmonizing ? 'Harmonizing Voice...' : 'Harmonize with Narration Style'}</span>
        </button>
      </div>

      {harmonizeNotice && (
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 animate-in fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{harmonizeNotice}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Scenario & Starting Environment */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Starting Scenario & Environmental Context
            </label>
            <button
              type="button"
              onClick={() =>
                setActiveRefineField({
                  title: 'Scenario & Environment',
                  content: scenario.environmentAndContext,
                  apply: text => updateScenario({ environmentAndContext: text }),
                })
              }
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={scenario.environmentAndContext}
            onChange={e => updateScenario({ environmentAndContext: e.target.value })}
            placeholder="e.g. A rain-slicked tavern rooftop in the Upper District at twilight. Distant clocktower chimes echo across the cobblestones..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* First Message (first_mes) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                First Message (Opening Scene) *
              </label>
              {hasRailroading ? (
                <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium">
                  <ShieldAlert className="w-3 h-3" />
                  Railroading Detected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  User Agency Preserved
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                setActiveRefineField({
                  title: 'First Message',
                  content: scenario.firstMessage,
                  apply: text => updateScenario({ firstMessage: text }),
                })
              }
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={6}
            value={scenario.firstMessage}
            onChange={e => updateScenario({ firstMessage: e.target.value })}
            placeholder="Describe the atmosphere, {{char}}'s actions, and end on an open hook for {{user}} without dictating {{user}}'s reactions..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
          />
        </div>

        {/* Alternate Greetings */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Alternate Greetings ({scenario.alternateGreetings.length})
            </label>
            <button
              type="button"
              onClick={handleAddGreeting}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Alternate</span>
            </button>
          </div>

          <div className="space-y-3">
            {scenario.alternateGreetings.map((greeting, idx) => (
              <div key={idx} className="relative group">
                <textarea
                  rows={3}
                  value={greeting}
                  onChange={e => handleUpdateGreeting(idx, e.target.value)}
                  placeholder={`Alternate greeting #${idx + 1}...`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGreeting(idx)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Remove greeting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Scenario Example Dialogues */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Multi-Scenario Example Dialogues ({'<START>'} Blocks)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Modern LLMs use these examples to anchor tone, slang, asterisks formatting, and emotional range
              </p>
            </div>
          </div>

          {/* Scenario 1: Casual / Everyday */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                1. Casual / Baseline Voice Dialogue
              </label>
              <button
                type="button"
                onClick={() =>
                  setActiveRefineField({
                    title: 'Casual Example Dialogue',
                    content: dialogues.casual,
                    apply: text => updateDialogues({ casual: text }),
                  })
                }
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                <Sparkles className="w-3 h-3" />
                <span>Refine</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={dialogues.casual}
              onChange={e => updateDialogues({ casual: e.target.value })}
              placeholder="<START>&#10;{{user}}: &quot;How's business?&quot;&#10;{{char}}: *Dry chuckle.* &quot;Quiet. Which means either everyone is behaving, or a storm is brewing.&quot;"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {/* Scenario 2: Conflict / Pressure */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
                2. Conflict / Under Pressure Dialogue
              </label>
              <button
                type="button"
                onClick={() =>
                  setActiveRefineField({
                    title: 'Conflict Example Dialogue',
                    content: dialogues.conflict,
                    apply: text => updateDialogues({ conflict: text }),
                  })
                }
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                <Sparkles className="w-3 h-3" />
                <span>Refine</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={dialogues.conflict}
              onChange={e => updateDialogues({ conflict: e.target.value })}
              placeholder="<START>&#10;{{user}}: &quot;Drop your weapon!&quot;&#10;{{char}}: *Eyes turn cold, fingers steady on the hilt.* &quot;Make your move, friend. But think about what comes next.&quot;"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          {/* Scenario 3: Vulnerable / Intimate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                3. Vulnerable / Emotional Dialogue
              </label>
              <button
                type="button"
                onClick={() =>
                  setActiveRefineField({
                    title: 'Vulnerable Example Dialogue',
                    content: dialogues.vulnerable,
                    apply: text => updateDialogues({ vulnerable: text }),
                  })
                }
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                <Sparkles className="w-3 h-3" />
                <span>Refine</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={dialogues.vulnerable}
              onChange={e => updateDialogues({ vulnerable: e.target.value })}
              placeholder="<START>&#10;{{user}}: &quot;You don't have to carry this alone.&quot;&#10;{{char}}: *A beat of silence passes before he looks down.* &quot;Everyone who stood by me ended up in the crosshairs.&quot;"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>
        </div>
      </div>

      {activeRefineField && (
        <SectionRefineModal
          isOpen={!!activeRefineField}
          onClose={() => setActiveRefineField(null)}
          sectionTitle={activeRefineField.title}
          currentContent={activeRefineField.content}
          onApply={activeRefineField.apply}
        />
      )}
    </div>
  );
};
