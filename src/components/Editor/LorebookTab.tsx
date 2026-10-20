import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { streamChatCompletion } from '../../services/aiClient';
import { Globe, Plus, Trash2, Sparkles, BookOpen, Key, Loader2 } from 'lucide-react';
import { LorebookEntry } from '../../types/sillytavern';

export const LorebookTab: React.FC = () => {
  const { profile, addLorebookEntry, updateLorebookEntry, removeLorebookEntry, setLorebook } = useCardStore();
  const { settings } = useSettingsStore();

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddNew = () => {
    addLorebookEntry({
      comment: 'New World Info Entry',
      keys: ['keyword'],
      secondary_keys: [],
      content: '',
      insertion_order: (profile.lorebook.length + 1) * 10,
      enabled: true,
      position: 'before_char',
    });
  };

  const handleGenerateWorldLore = async () => {
    if (!settings.baseUrl) {
      alert('AI Base URL is not configured. Please open Settings.');
      return;
    }

    setIsGenerating(true);
    const prompt = `Based on this character:
Name: ${profile.identity.name}
Archetype: ${profile.identity.archetype}
Backstory: ${profile.background.backstory}

Generate 3 rich, interconnected World Info / Lorebook entries for SillyTavern.
Output ONLY a JSON array with this schema:
[
  {
    "comment": "Key Location or City",
    "keys": ["Primary Key", "Secondary"],
    "secondary_keys": ["context", "tag"],
    "content": "2-3 concise factual sentences explaining the place, history, or atmosphere."
  },
  {
    "comment": "Major Faction or Guild",
    "keys": ["Faction Name"],
    "secondary_keys": ["allies", "members"],
    "content": "2-3 sentences explaining faction goals and reputation."
  },
  {
    "comment": "Magic or Technology System",
    "keys": ["Term"],
    "secondary_keys": ["rules"],
    "content": "2-3 sentences explaining the mechanics and dangers."
  }
]`;

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
      if (Array.isArray(parsed)) {
        const newEntries: LorebookEntry[] = parsed.map((item, idx) => ({
          id: idx + 1,
          comment: item.comment || `Entry #${idx + 1}`,
          keys: Array.isArray(item.keys) ? item.keys : ['Lore'],
          secondary_keys: Array.isArray(item.secondary_keys) ? item.secondary_keys : [],
          content: item.content || '',
          insertion_order: (idx + 1) * 10,
          enabled: true,
          position: 'before_char',
        }));
        setLorebook(newEntries);
      }
    } catch (err: any) {
      alert(`Failed to generate lorebook: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Embedded World Info & Lorebook ({profile.lorebook.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            World concepts, factions, and locations that auto-activate in chat when mentioned
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateWorldLore}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Auto-Generate Lore</span>
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {profile.lorebook.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-950 border border-slate-800">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white">No Lorebook Entries Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Add world information to give your character deeper environmental awareness without bloating their permanent tokens.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleGenerateWorldLore}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
            >
              Generate with AI
            </button>
            <button
              type="button"
              onClick={handleAddNew}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {profile.lorebook.map(entry => (
            <div
              key={entry.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 transition-colors hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <input
                  type="text"
                  value={entry.comment || ''}
                  onChange={e => updateLorebookEntry(entry.id, { comment: e.target.value })}
                  placeholder="Entry Title / Concept..."
                  className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-sm font-bold text-white px-1 py-0.5 focus:outline-none"
                />

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entry.enabled}
                      onChange={e => updateLorebookEntry(entry.id, { enabled: e.target.checked })}
                      className="rounded accent-indigo-500"
                    />
                    <span>Enabled</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLorebookEntry(entry.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Keys */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Primary Trigger Keys (comma separated) *
                  </label>
                  <input
                    type="text"
                    value={entry.keys.join(', ')}
                    onChange={e =>
                      updateLorebookEntry(entry.id, {
                        keys: e.target.value.split(',').map(k => k.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. Grand Spire, Spire"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Secondary Trigger Keys (optional)
                  </label>
                  <input
                    type="text"
                    value={(entry.secondary_keys || []).join(', ')}
                    onChange={e =>
                      updateLorebookEntry(entry.id, {
                        secondary_keys: e.target.value.split(',').map(k => k.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. city, district"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  World Entry Content
                </label>
                <textarea
                  rows={3}
                  value={entry.content}
                  onChange={e => updateLorebookEntry(entry.id, { content: e.target.value })}
                  placeholder="2-3 concise factual sentences describing this location, faction, artifact, or magical rule..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
