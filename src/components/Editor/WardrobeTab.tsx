import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { Shirt, Sparkles } from 'lucide-react';
import { SectionRefineModal } from '../AI/SectionRefineModal';

export const WardrobeTab: React.FC = () => {
  const { profile, updateWardrobe } = useCardStore();
  const { wardrobe } = profile;

  const [activeRefineField, setActiveRefineField] = useState<{
    title: string;
    content: string;
    key: keyof typeof wardrobe;
  } | null>(null);

  const handleOpenRefine = (key: keyof typeof wardrobe, title: string) => {
    setActiveRefineField({
      title: `Wardrobe & Attire - ${title}`,
      content: wardrobe[key],
      key,
    });
  };

  const handleApplyRefine = (newContent: string) => {
    if (activeRefineField) {
      updateWardrobe({ [activeRefineField.key]: newContent });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shirt className="w-4 h-4 text-indigo-400" />
            What They Wear (Wardrobe & Gear)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Head-to-toe attire, fabric materials, accessories, and carried gear to maintain visual consistency
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Signature / Everyday Outfit */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Signature / Everyday Outfit *
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('signatureOutfit', 'Signature Outfit')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={wardrobe.signatureOutfit}
            onChange={e => updateWardrobe({ signatureOutfit: e.target.value })}
            placeholder="e.g. Fitted charcoal-gray hooded tunic made of supple boiled leather and sound-dampening silk; dark fitted breeches reinforced at the knees..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Footwear */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Footwear
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('footwear', 'Footwear')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={wardrobe.footwear}
            onChange={e => updateWardrobe({ footwear: e.target.value })}
            placeholder="e.g. Soft-soled calfskin stalker boots enchanted with subtle vibration-muffling runes..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Accessories & Jewelry */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Accessories, Jewelry & Trinkets
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('accessoriesAndJewelry', 'Accessories')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={wardrobe.accessoriesAndJewelry}
            onChange={e => updateWardrobe({ accessoriesAndJewelry: e.target.value })}
            placeholder="e.g. Fingerless archer gloves, a twin leather bandolier holding smoke vials and lockpicks, a tarnished silver signet ring on a chain..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Equipment & Weapons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Carried Equipment, Tools & Weapons
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('equipmentAndWeapons', 'Equipment & Weapons')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={wardrobe.equipmentAndWeapons}
            onChange={e => updateWardrobe({ equipmentAndWeapons: e.target.value })}
            placeholder="e.g. A concealed spring-loaded stiletto in his right bracer, and a short, recurve hunting bow strapped across his back..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Alternate Outfits */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Alternate Outfits (Formal, Travel, Combat, Stealth)
            </label>
            <button
              type="button"
              onClick={() => handleOpenRefine('alternateOutfits', 'Alternate Outfits')}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              <Sparkles className="w-3 h-3" />
              <span>Refine with AI</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={wardrobe.alternateOutfits}
            onChange={e => updateWardrobe({ alternateOutfits: e.target.value })}
            placeholder="e.g. A formal velvet high-collared diplomat coat used for social infiltration and masquerades..."
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
