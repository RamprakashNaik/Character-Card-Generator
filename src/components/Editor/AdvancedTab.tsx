import React from 'react';
import { useCardStore } from '../../store/useCardStore';
import {
  Sliders,
  Terminal,
  FileText,
  Check,
  Feather,
  Compass,
  Clock,
  Sparkles,
  Info,
  BookOpen,
} from 'lucide-react';
import { FormattingStyle } from '../../types/sillytavern';

export const AdvancedTab: React.FC = () => {
  const { profile, updateGuardrails, formattingStyle, setFormattingStyle } = useCardStore();
  const { guardrails } = profile;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            Narration Style & Roleplay Steering Directives
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure how the AI describes the scene, dialogue formatting, and where it steers the story in SillyTavern
          </p>
        </div>
      </div>

      {/* Explanatory Callout for SillyTavern System Prompt vs Depth Prompt */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-200">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-indigo-100">How SillyTavern Applies These Settings:</div>
          <p className="text-[11px] text-indigo-200/80 leading-relaxed">
            • <strong>Narration Style & Perspective</strong> are embedded into the card's <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-indigo-300">system_prompt</code> (replacing or reinforcing SillyTavern's default system prompt).<br />
            • <strong>Story Direction & Pacing</strong> are embedded into <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-indigo-300">post_history_instructions</code> (Depth Prompt), which is injected near recent chat messages to keep the AI on track every turn!
          </p>
        </div>
      </div>

      {/* 1. Narration Style Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Feather className="w-3.5 h-3.5 text-indigo-400" />
          <span>Narration & Descriptive Writing Style</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: 'literary',
              title: 'Atmospheric Literary',
              desc: 'Sensory immersion, detailed environment, lighting, textures, and physical micro-expressions before speech.',
            },
            {
              id: 'cinematic',
              title: 'Cinematic & Action-Driven',
              desc: 'Dynamic camera-like blocking, physical choreography, fast environmental interactions, and visual focus.',
            },
            {
              id: 'visceral',
              title: 'Visceral & Psychological',
              desc: 'Intense physical sensations (heart rate, adrenaline, physical touch, breathing, internal conflict).',
            },
            {
              id: 'conversational',
              title: 'Dialogue-Focused & Banter',
              desc: 'Sharp conversational exchange, natural spoken cadence, witty banter, and concise physical gestures.',
            },
          ].map(style => (
            <button
              key={style.id}
              type="button"
              onClick={() => updateGuardrails({ narrationStyle: style.id as any })}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                guardrails.narrationStyle === style.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{style.title}</span>
                {guardrails.narrationStyle === style.id && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Perspective (POV) & Pacing Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        {/* POV Perspective */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Narrative Perspective (POV)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'third_person', label: 'Third-Person', hint: '{{char}} looked...' },
              { id: 'first_person', label: 'First-Person', hint: 'I looked...' },
            ].map(pov => (
              <button
                key={pov.id}
                type="button"
                onClick={() => updateGuardrails({ povPerspective: pov.id as any })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  guardrails.povPerspective === pov.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white">{pov.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{pov.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Turn Pacing */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Turn Pacing & Plot Progression</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'slow_burn', label: 'Slow-Burn', hint: 'Unhurried' },
              { id: 'balanced', label: 'Balanced', hint: 'Natural' },
              { id: 'fast_paced', label: 'Fast-Paced', hint: 'Dynamic' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => updateGuardrails({ pacingRule: p.id as any })}
                className={`p-2 rounded-xl border text-center transition-all ${
                  guardrails.pacingRule === p.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white">{p.label}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{p.hint}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Story Trajectory & Roleplay Goal ("How it should tell the roleplay to go") */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Story Direction & Roleplay Objective ("Where the plot should steer")</span>
          </label>
          <span className="text-[10px] text-indigo-400 font-mono">Injected at Depth</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
          Tell the AI what narrative goals or tension to pursue during the roleplay without speaking for {'{{user}}'}.
        </p>
        <textarea
          rows={3}
          value={guardrails.storyGoalAndDirection}
          onChange={e => updateGuardrails({ storyGoalAndDirection: e.target.value })}
          placeholder="e.g. Steer the narrative toward uncovering the guild conspiracy. Introduce environmental hazards like failing weather or approaching guards to maintain tension, while leaving tactical decisions to {{user}}..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
        />
      </div>

      {/* 4. Compilation Style Preset */}
      <div className="pt-2 border-t border-slate-800">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Card Output Formatting Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'natural',
              title: 'Natural Prose (Plauto)',
              desc: 'Markdown headings & clean narrative. Recommended for Claude 3.5, Llama 3, & GPT-4o.',
            },
            {
              id: 'boostily',
              title: 'Ali:Chat / Boostily',
              desc: 'Bracketed traits [Appearance: "..."][Clothing: "..."]. Compact and structured.',
            },
            {
              id: 'wpp',
              title: 'W++ Format',
              desc: '[character("Name") { ... }]. Traditional tavern bracket syntax.',
            },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFormattingStyle(opt.id as FormattingStyle)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                formattingStyle === opt.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{opt.title}</span>
                {formattingStyle === opt.id && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Behavioral Guardrails Toggles */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Behavioral Guardrails
        </label>

        {/* Prevent User Impersonation */}
        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={guardrails.preventUserImpersonation}
            onChange={e => updateGuardrails({ preventUserImpersonation: e.target.checked })}
            className="mt-1 rounded accent-indigo-500 shrink-0"
          />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Anti-Impersonation Directive (Zero User Railroading)</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Recommended
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Instructs the model to never speak or act for {'{{user}}'}, always ending replies with a clear hook passing turn to {'{{user}}'}.
            </div>
          </div>
        </label>
      </div>

      {/* 6. Custom Overrides */}
      <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Additional System Prompt Text</span>
          </label>
          <textarea
            rows={2}
            value={guardrails.customSystemPrompt}
            onChange={e => updateGuardrails({ customSystemPrompt: e.target.value })}
            placeholder="Appended into system_prompt..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Creator Notes</span>
          </label>
          <textarea
            rows={2}
            value={guardrails.creatorNotes}
            onChange={e => updateGuardrails({ creatorNotes: e.target.value })}
            placeholder="Notes shown in SillyTavern character info..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
          />
        </div>
      </div>
    </div>
  );
};
