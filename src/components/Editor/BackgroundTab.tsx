import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { BookOpen, Sparkles, Key, Target, Users } from 'lucide-react';
import { SectionRefineModal } from '../AI/SectionRefineModal';

export const BackgroundTab: React.FC = () => {
  const { profile, updateBackground } = useCardStore();
  const { background } = profile;

  const [activeRefineField, setActiveRefineField] = useState<{
    title: string;
    content: string;
    key: keyof typeof background;
  } | null>(null);

  const handleOpenRefine = (key: keyof typeof background, title: string) => {
    setActiveRefineField({
      title: `Background & Lore - ${title}`,
      content: background[key],
      key,
    });
  };

  const handleApplyRefine = (newContent: string) => {
    if (activeRefineField) {
      updateBackground({ [activeRefineField.key]: newContent });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Background, Lore & Dynamic with {'{{user}}'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formative history, current quest, hidden secrets, and their relationship with the user
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Backstory */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Backstory & Formative History *
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('backstory', 'Backstory')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={background.backstory}
            onChange={e => updateBackground({ backstory: e.target.value })}
            placeholder="e.g. Orphaned in the low slums of the Grand Spire, recruited into the Silent Weave thieves guild..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Dynamic with {{user}} */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Relationship & Dynamic with {'{{user}}'}</span>
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('dynamicWithUser', 'Relationship with {{user}}')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={background.dynamicWithUser}
            onChange={e => updateBackground({ dynamicWithUser: e.target.value })}
            placeholder="e.g. Initially guarded and watchful, treating {{user}} as an unpredictable variable until {{user}} proves their loyalty..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Current Occupation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Current Occupation & Social Status
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('currentOccupation', 'Occupation')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={background.currentOccupation}
            onChange={e => updateBackground({ currentOccupation: e.target.value })}
            placeholder="e.g. Independent relic retriever and high-stakes mercenary scout..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Motivations */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Driving Motivations & Goals</span>
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('motivations', 'Motivations')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={background.motivations}
            onChange={e => updateBackground({ motivations: e.target.value })}
            placeholder="e.g. Unraveling the mystery of the arcane glyph branded on his arm and ensuring his sister's safety..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Secrets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Hidden Secrets & Vulnerabilities</span>
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('secrets', 'Secrets')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={background.secrets}
            onChange={e => updateBackground({ secrets: e.target.value })}
            placeholder="e.g. Possesses a stolen fragment of the Primordial Archive and is slowly being tracked by imperial hounds..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>
      </div>

      {activeRefineField && (
        <SectionRefineModal
          isOpen={!!activeRefineField}
          onClose={() => setActiveRefineField(null)}
          sectionTitle={activeRefineField.title}
          currentContent={activeRefineField.content}
          onApply={handleApplyRefine}
        />
      )}
    </div>
  );
};
