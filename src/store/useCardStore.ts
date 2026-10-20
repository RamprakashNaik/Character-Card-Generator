import { create } from 'zustand';
import {
  GranularCharacterProfile,
  FormattingStyle,
  LorebookEntry,
} from '../types/sillytavern';
import { createDefaultProfile } from '../utils/formatters';

export type TabKey =
  | 'identity'
  | 'appearance'
  | 'wardrobe'
  | 'personality'
  | 'background'
  | 'dialogue'
  | 'lorebook'
  | 'advanced';

interface CardState {
  profile: GranularCharacterProfile;
  formattingStyle: FormattingStyle;
  activeTab: TabKey;
  history: GranularCharacterProfile[];
  historyIndex: number;

  setActiveTab: (tab: TabKey) => void;
  setFormattingStyle: (style: FormattingStyle) => void;
  setProfile: (profile: GranularCharacterProfile) => void;
  updateIdentity: (updates: Partial<GranularCharacterProfile['identity']>) => void;
  updateAppearance: (updates: Partial<GranularCharacterProfile['appearance']>) => void;
  updateWardrobe: (updates: Partial<GranularCharacterProfile['wardrobe']>) => void;
  updatePersonality: (updates: Partial<GranularCharacterProfile['personality']>) => void;
  updateBackground: (updates: Partial<GranularCharacterProfile['background']>) => void;
  updateScenario: (updates: Partial<GranularCharacterProfile['scenario']>) => void;
  updateDialogues: (updates: Partial<GranularCharacterProfile['dialogues']>) => void;
  updateGuardrails: (updates: Partial<GranularCharacterProfile['guardrails']>) => void;
  setLorebook: (entries: LorebookEntry[]) => void;
  addLorebookEntry: (entry: Omit<LorebookEntry, 'id'>) => void;
  updateLorebookEntry: (id: number, updates: Partial<LorebookEntry>) => void;
  removeLorebookEntry: (id: number) => void;

  // History & Reset
  undo: () => void;
  redo: () => void;
  resetToDefault: () => void;
}

const STORAGE_PROFILE_KEY = 'sillytavern_card_generator_profile';

function loadInitialProfile(): GranularCharacterProfile {
  const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return createDefaultProfile();
}

export const useCardStore = create<CardState>((set, get) => {
  const initial = loadInitialProfile();

  const recordHistory = (newProfile: GranularCharacterProfile) => {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
    const { history, historyIndex } = get();
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newProfile);
    if (updatedHistory.length > 25) updatedHistory.shift();

    set({
      profile: newProfile,
      history: updatedHistory,
      historyIndex: updatedHistory.length - 1,
    });
  };

  return {
    profile: initial,
    formattingStyle: 'natural',
    activeTab: 'identity',
    history: [initial],
    historyIndex: 0,

    setActiveTab: tab => set({ activeTab: tab }),
    setFormattingStyle: style => set({ formattingStyle: style }),

    setProfile: newProfile => {
      recordHistory(newProfile);
    },

    updateIdentity: updates => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        identity: { ...current.identity, ...updates },
      };
      recordHistory(updated);
    },

    updateAppearance: updates => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        appearance: { ...current.appearance, ...updates },
      };
      recordHistory(updated);
    },

    updateWardrobe: updates => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        wardrobe: { ...current.wardrobe, ...updates },
      };
      recordHistory(updated);
    },

    updatePersonality: updates => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        personality: { ...current.personality, ...updates },
      };
      recordHistory(updated);
    },

    updateBackground: updates => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        background: { ...current.background, ...updates },
      };
      recordHistory(updated);
    },

    updateScenario: updates => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        scenario: { ...current.scenario, ...updates },
      };
      recordHistory(updated);
    },

    updateDialogues: updates => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        dialogues: { ...current.dialogues, ...updates },
      };
      recordHistory(updated);
    },

    updateGuardrails: updates => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        guardrails: { ...current.guardrails, ...updates },
      };
      recordHistory(updated);
    },

    setLorebook: entries => {
      const current = get().profile;
      const updated: GranularCharacterProfile = {
        ...current,
        lorebook: entries,
      };
      recordHistory(updated);
    },

    addLorebookEntry: entryData => {
      const current = get().profile;
      const nextId = Math.max(0, ...current.lorebook.map(e => e.id)) + 1;
      const newEntry: LorebookEntry = { ...entryData, id: nextId };
      const updated: GranularCharacterProfile = {
        ...current,
        lorebook: [...current.lorebook, newEntry],
      };
      recordHistory(updated);
    },

    updateLorebookEntry: (id, updates) => {
      const current = get().profile;
      const updatedLorebook = current.lorebook.map(e =>
        e.id === id ? { ...e, ...updates } : e
      );
      const updated: GranularCharacterProfile = {
        ...current,
        lorebook: updatedLorebook,
      };
      recordHistory(updated);
    },

    removeLorebookEntry: id => {
      const current = get().profile;
      const updatedLorebook = current.lorebook.filter(e => e.id !== id);
      const updated: GranularCharacterProfile = {
        ...current,
        lorebook: updatedLorebook,
      };
      recordHistory(updated);
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        set({
          profile: history[nextIndex],
          historyIndex: nextIndex,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        set({
          profile: history[nextIndex],
          historyIndex: nextIndex,
        });
      }
    },

    resetToDefault: () => {
      const fresh = createDefaultProfile();
      recordHistory(fresh);
    },
  };
});
