import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { Heart, Sparkles, MessageCircle, Smile, Frown } from 'lucide-react';
import { SectionRefineModal } from '../AI/SectionRefineModal';

export const PersonalityTab: React.FC = () => {
  const { profile, updatePersonality } = useCardStore();
  const { personality } = profile;

  const [newTrait, setNewTrait] = useState('');
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');

  const [activeRefineField, setActiveRefineField] = useState<{
    title: string;
    content: string;
    key: 'psychologicalProfile' | 'speechMannerisms';
  } | null>(null);

  const handleAddTrait = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const t = newTrait.trim();
    if (t && !personality.coreTraits.includes(t)) {
      updatePersonality({ coreTraits: [...personality.coreTraits, t] });
      setNewTrait('');
    }
  };

  const handleAddLike = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const l = newLike.trim();
    if (l && !personality.likes.includes(l)) {
      updatePersonality({ likes: [...personality.likes, l] });
      setNewLike('');
    }
  };

  const handleAddDislike = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const d = newDislike.trim();
    if (d && !personality.dislikes.includes(d)) {
      updatePersonality({ dislikes: [...personality.dislikes, d] });
      setNewDislike('');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            Personality, Psychology & Speech Voice
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Core behavioral drives, psychological depth, quirks, and vocal cadence
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Core Traits */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Core Personality Traits (3-6 Keywords)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {personality.coreTraits.map(trait => (
              <span
                key={trait}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-200"
              >
                <span>{trait}</span>
                <button
                  type="button"
                  onClick={() =>
                    updatePersonality({
                      coreTraits: personality.coreTraits.filter(t => t !== trait),
                    })
                  }
                  className="text-indigo-400 hover:text-rose-400 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={newTrait}
              onChange={e => setNewTrait(e.target.value)}
              onKeyDown={handleAddTrait}
              placeholder="Add trait (e.g. Observant)..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddTrait}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Psychological Profile */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Detailed Psychological Profile & Mindset
            </label>
            <button
              type="button"
              onClick={() =>
                setActiveRefineField({
                  title: 'Psychological Profile',
                  content: personality.psychologicalProfile,
                  key: 'psychologicalProfile',
                })
              }
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={personality.psychologicalProfile}
            onChange={e => updatePersonality({ psychologicalProfile: e.target.value })}
            placeholder="e.g. Pragmatic survivor who masks genuine empathy behind cynical humor. Has deep trust issues stemming from guild betrayal, yet is fiercely protective of those in his inner circle..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Speech Mannerisms & Voice */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Speech Mannerisms, Accent & Voice Tone
            </label>
            <button
              type="button"
              onClick={() =>
                setActiveRefineField({
                  title: 'Speech Mannerisms & Voice',
                  content: personality.speechMannerisms,
                  key: 'speechMannerisms',
                })
              }
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={personality.speechMannerisms}
            onChange={e => updatePersonality({ speechMannerisms: e.target.value })}
            placeholder="e.g. Low, smooth baritone; speaks in deliberate, measured sentences with a wry, sarcastic undertone. Rarely raises his voice; uses thieves' cant slang when irritated..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Likes and Dislikes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          {/* Likes */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Smile className="w-3.5 h-3.5 text-emerald-400" />
              <span>Likes / Preferences</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {personality.likes.map(like => (
                <span
                  key={like}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200"
                >
                  <span>{like}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updatePersonality({
                        likes: personality.likes.filter(l => l !== like),
                      })
                    }
                    className="text-emerald-400 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLike}
                onChange={e => setNewLike(e.target.value)}
                onKeyDown={handleAddLike}
                placeholder="Add like..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddLike}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Dislikes */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Frown className="w-3.5 h-3.5 text-rose-400" />
              <span>Dislikes / Pet Peeves</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {personality.dislikes.map(dislike => (
                <span
                  key={dislike}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200"
                >
                  <span>{dislike}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updatePersonality({
                        dislikes: personality.dislikes.filter(d => d !== dislike),
                      })
                    }
                    className="text-rose-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDislike}
                onChange={e => setNewDislike(e.target.value)}
                onKeyDown={handleAddDislike}
                placeholder="Add dislike..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddDislike}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Quirks & Habits */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Quirks & Unconscious Habits
          </label>
          <textarea
            rows={2}
            value={personality.quirksAndHabits.join('\n')}
            onChange={e =>
              updatePersonality({
                quirksAndHabits: e.target.value.split('\n').filter(Boolean),
              })
            }
            placeholder="e.g. Subconsciously flips a silver coin through his knuckles when calculating risks&#10;Never sits with his back to a door..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
          />
        </div>
      </div>

      {activeRefineField && (
        <SectionRefineModal
          isOpen={!!activeRefineField}
          onClose={() => setActiveRefineField(null)}
          sectionTitle={activeRefineField.title}
          currentContent={activeRefineField.content}
          onApply={newContent => {
            updatePersonality({ [activeRefineField.key]: newContent });
          }}
        />
      )}
    </div>
  );
};
