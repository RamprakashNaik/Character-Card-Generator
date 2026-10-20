import React from 'react';
import { useCardStore } from '../../store/useCardStore';
import { Sliders, ShieldCheck, Terminal, FileText, Check } from 'lucide-react';
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
            System Directives & Guardrails
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure prompt compilation formats, anti-leak guardrails, and roleplay directives
          </p>
        </div>
      </div>

      {/* Formatting Preset Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Compilation Style Preset
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
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                formattingStyle === opt.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{opt.title}</span>
                {formattingStyle === opt.id && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Guardrails Toggles */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Pro-Grade Behavioral Guardrails
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
              <span>Anti-Impersonation Directive (Zero Railroading)</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Recommended
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Instructs the model to never speak or act for {'{{user}}'}, always ending replies with a clear hook passing turn to {'{{user}}'}.
            </div>
          </div>
        </label>

        {/* Sensory Prose Style */}
        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={guardrails.immersiveProseStyle}
            onChange={e => updateGuardrails({ immersiveProseStyle: e.target.checked })}
            className="mt-1 rounded accent-indigo-500 shrink-0"
          />
          <div>
            <div className="text-xs font-bold text-white">Sensory Prose & Micro-Expressions</div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Encourages vivid environmental descriptions (lighting, sounds, micro-expressions) and show-don't-tell emotional cues.
            </div>
          </div>
        </label>

        {/* Past Tense Narration */}
        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={guardrails.pastTenseNarration}
            onChange={e => updateGuardrails({ pastTenseNarration: e.target.checked })}
            className="mt-1 rounded accent-indigo-500 shrink-0"
          />
          <div>
            <div className="text-xs font-bold text-white">Third-Person Past-Tense Consistency</div>
            <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Enforces consistent literary third-person past-tense narration across multi-turn roleplay.
            </div>
          </div>
        </label>
      </div>

      {/* Custom System Prompt Override */}
      <div className="pt-2 border-t border-slate-800">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Custom System Prompt Override</span>
        </label>
        <textarea
          rows={3}
          value={guardrails.customSystemPrompt}
          onChange={e => updateGuardrails({ customSystemPrompt: e.target.value })}
          placeholder="Optional custom system directives to append into system_prompt..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
        />
      </div>

      {/* Post-History Instructions */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Post-History Instructions (Depth Prompt)
        </label>
        <textarea
          rows={2}
          value={guardrails.postHistoryInstructions}
          onChange={e => updateGuardrails({ postHistoryInstructions: e.target.value })}
          placeholder="Injected at depth in SillyTavern after chat history (e.g. [Write with visceral pacing...])"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
        />
      </div>

      {/* Creator Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Creator Notes / Lorebook Instructions</span>
        </label>
        <textarea
          rows={2}
          value={guardrails.creatorNotes}
          onChange={e => updateGuardrails({ creatorNotes: e.target.value })}
          placeholder="Notes visible in SillyTavern character information tab..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
        />
      </div>
    </div>
  );
};
