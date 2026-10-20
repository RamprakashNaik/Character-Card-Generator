import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { Wand2, Eye, Sparkles } from 'lucide-react';
import { SectionRefineModal } from '../AI/SectionRefineModal';

export const AppearanceTab: React.FC = () => {
  const { profile, updateAppearance } = useCardStore();
  const { appearance } = profile;

  const [activeRefineField, setActiveRefineField] = useState<{
    title: string;
    content: string;
    key: keyof typeof appearance;
  } | null>(null);

  const handleOpenRefine = (key: keyof typeof appearance, title: string) => {
    setActiveRefineField({
      title: `Physical Appearance - ${title}`,
      content: appearance[key],
      key,
    });
  };

  const handleApplyRefine = (newContent: string) => {
    if (activeRefineField) {
      updateAppearance({ [activeRefineField.key]: newContent });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            How They Look (Physical Appearance)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed facial features, physical build, and distinct markings for immersive descriptive roleplay
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Height & Build */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Height, Weight & Physical Build
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('heightAndBuild', 'Height & Build')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={appearance.heightAndBuild}
            onChange={e => updateAppearance({ heightAndBuild: e.target.value })}
            placeholder={'e.g. 6\'1" (185 cm), lean athletic build with broad shoulders and wiry muscle built for climbing...'}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Face & Eyes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Face Structure & Eyes
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('faceAndEyes', 'Face & Eyes')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={appearance.faceAndEyes}
            onChange={e => updateAppearance({ faceAndEyes: e.target.value })}
            placeholder="e.g. Sharp angular jawline, slight stubble. Piercing storm-gray eyes with faint glowing flecks..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Hair */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hair (Color, Length, Style & Texture)
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('hair', 'Hair')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={appearance.hair}
            onChange={e => updateAppearance({ hair: e.target.value })}
            placeholder="e.g. Tousled raven-black hair, trimmed close at the sides and falling loosely over his forehead..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Complexion & Skin */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Complexion & Skin Tone
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('complexion', 'Complexion')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={appearance.complexion}
            onChange={e => updateAppearance({ complexion: e.target.value })}
            placeholder="e.g. Pale olive skin, naturally weathered from high altitude winds..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Distinctive Marks */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Distinctive Marks (Scars, Tattoos, Piercings, Cybernetics, Horns)
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('distinctiveMarks', 'Distinctive Marks')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={appearance.distinctiveMarks}
            onChange={e => updateAppearance({ distinctiveMarks: e.target.value })}
            placeholder="e.g. A thin faded blade scar across his left eyebrow, and a glowing cyan arcane glyph branded on his inner forearm..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* General Presence */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Physical Aura & Presence
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('generalImpressions', 'Physical Aura')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={appearance.generalImpressions}
            onChange={e => updateAppearance({ generalImpressions: e.target.value })}
            placeholder="e.g. Moves with silent predatory grace; always stays near shadowy corners and exits..."
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
