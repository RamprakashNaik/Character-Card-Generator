import React, { useRef, useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import {
  Upload,
  Trash2,
  Tag,
  Sparkles,
  User,
  Shield,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { ArtPromptModal } from '../AI/ArtPromptModal';

export const IdentityTab: React.FC = () => {
  const { profile, updateIdentity } = useCardStore();
  const { identity } = profile;

  const [newTag, setNewTag] = useState('');
  const [showArtModal, setShowArtModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateIdentity({ avatarUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const tag = newTag.trim();
    if (tag && !identity.tags.includes(tag)) {
      updateIdentity({ tags: [...identity.tags, tag] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateIdentity({
      tags: identity.tags.filter(t => t !== tagToRemove),
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Avatar & Core Identity Grid */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Avatar Area */}
        <div className="flex flex-col items-center gap-3 w-full sm:w-auto shrink-0">
          <div className="relative group w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-700 hover:border-indigo-500/80 transition-all flex flex-col items-center justify-center shadow-xl">
            {identity.avatarUrl ? (
              <>
                <img
                  src={identity.avatarUrl}
                  alt={identity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-indigo-600 text-white text-xs hover:bg-indigo-500"
                    title="Change Avatar"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateIdentity({ avatarUrl: '' })}
                    className="p-2 rounded-xl bg-rose-600 text-white text-xs hover:bg-rose-500"
                    title="Remove Avatar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 text-center cursor-pointer group-hover:text-indigo-400 text-slate-500 transition-colors w-full h-full"
              >
                <Upload className="w-6 h-6 mb-1 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span className="text-xs font-semibold text-slate-300">Upload Avatar</span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, or WebP</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowArtModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 hover:bg-pink-500/20 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Art Prompt Generator</span>
          </button>
        </div>

        {/* Identity Fields */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Character Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Character Name *
            </label>
            <input
              type="text"
              value={identity.name}
              onChange={e => updateIdentity({ name: e.target.value })}
              placeholder="e.g. Vaelin Thorne"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          {/* Nickname / Alias */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nickname / Alias
            </label>
            <input
              type="text"
              value={identity.nickname}
              onChange={e => updateIdentity({ nickname: e.target.value })}
              placeholder="e.g. The Ghost of the Spire"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Role / Archetype */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Role / Archetype
            </label>
            <input
              type="text"
              value={identity.archetype}
              onChange={e => updateIdentity({ archetype: e.target.value })}
              placeholder="e.g. Rogue Infiltrator / Arcane Scholar"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Age
            </label>
            <input
              type="text"
              value={identity.age}
              onChange={e => updateIdentity({ age: e.target.value })}
              placeholder="e.g. 28, 200+ (Appears 25)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Gender
            </label>
            <input
              type="text"
              value={identity.gender}
              onChange={e => updateIdentity({ gender: e.target.value })}
              placeholder="e.g. Male, Female, Non-Binary, Androgynous"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Species / Race */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Species / Race
            </label>
            <input
              type="text"
              value={identity.species}
              onChange={e => updateIdentity({ species: e.target.value })}
              placeholder="e.g. Human, High Elf, Cybernetically Augmented Human, Demonkin"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="pt-4 border-t border-slate-800">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Character Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {identity.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-slate-400 hover:text-rose-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 max-w-sm">
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag (press Enter)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Creator & Version */}
      <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Creator Name
          </label>
          <input
            type="text"
            value={identity.creator}
            onChange={e => updateIdentity({ creator: e.target.value })}
            placeholder="Your author pseudonym"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Card Version
          </label>
          <input
            type="text"
            value={identity.version}
            onChange={e => updateIdentity({ version: e.target.value })}
            placeholder="1.0"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {showArtModal && <ArtPromptModal isOpen={showArtModal} onClose={() => setShowArtModal(false)} />}
    </div>
  );
};
