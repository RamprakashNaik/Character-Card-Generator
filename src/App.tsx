import React, { useState, useEffect } from 'react';
import { useCardStore } from './store/useCardStore';
import { useSettingsStore } from './store/useSettingsStore';
import { Navbar } from './components/Navbar';
import { EditorTabs } from './components/Editor/EditorTabs';
import { IdentityTab } from './components/Editor/IdentityTab';
import { AppearanceTab } from './components/Editor/AppearanceTab';
import { WardrobeTab } from './components/Editor/WardrobeTab';
import { PersonalityTab } from './components/Editor/PersonalityTab';
import { BackgroundTab } from './components/Editor/BackgroundTab';
import { DialogueTab } from './components/Editor/DialogueTab';
import { LorebookTab } from './components/Editor/LorebookTab';
import { AdvancedTab } from './components/Editor/AdvancedTab';
import { TokenHeatmap } from './components/Preview/TokenHeatmap';
import { SettingsModal } from './components/SettingsModal';
import { IdeaWizardModal } from './components/Wizard/IdeaWizardModal';
import { TestChatModal } from './components/Sandbox/TestChatModal';
import { ExportModal } from './components/Preview/ExportModal';
import { AuditorModal } from './components/AI/AuditorModal';
import { extractCharacterFromPng } from './utils/pngMetadata';
import { v2CardToProfile } from './utils/formatters';
import {
  Sparkles,
  Download,
  MessageSquare,
  ShieldCheck,
  Undo2,
  Redo2,
  RotateCcw,
  Layers,
  Upload,
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    profile,
    activeTab,
    historyIndex,
    history,
    undo,
    redo,
    resetToDefault,
    setProfile,
  } = useCardStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuditorOpen, setIsAuditorOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Global Drag & Drop Handler for SillyTavern PNG & JSON cards
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      try {
        if (file.name.toLowerCase().endsWith('.png')) {
          const arrayBuffer = await file.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          const extracted = extractCharacterFromPng(uint8);

          if (!extracted) {
            alert('No SillyTavern metadata found in this PNG.');
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const avatarUrl = typeof reader.result === 'string' ? reader.result : '';
            const newProfile = v2CardToProfile(extracted, avatarUrl);
            setProfile(newProfile);
          };
          reader.readAsDataURL(file);
        } else if (file.name.toLowerCase().endsWith('.json')) {
          const text = await file.text();
          const json = JSON.parse(text);
          const newProfile = v2CardToProfile(json);
          setProfile(newProfile);
        }
      } catch (err: any) {
        console.error('Drop error:', err);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [setProfile]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuditor={() => setIsAuditorOpen(true)}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-indigo-950/80 backdrop-blur-sm border-4 border-dashed border-indigo-400 flex flex-col items-center justify-center p-4 animate-in fade-in">
          <Upload className="w-16 h-16 text-indigo-400 animate-bounce mb-3" />
          <h2 className="text-xl font-bold text-white">Drop SillyTavern PNG or JSON here</h2>
          <p className="text-sm text-indigo-200 mt-1">
            Instantly extracts character card fields, world info, and avatar
          </p>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Granular Editor */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-w-0">
          {/* Subheader: Character Name + Undo/Redo & Reset Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white truncate flex items-center gap-2">
                <span>{profile.identity.name || 'Unnamed Character'}</span>
                {profile.identity.nickname && (
                  <span className="text-xs text-indigo-400 font-normal truncate hidden sm:inline">
                    "{profile.identity.nickname}"
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {profile.identity.archetype || 'Design your roleplay character'}
              </p>
            </div>

            {/* Undo / Redo / Reset toolbar */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-800 mx-1" />
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset character to default template?')) {
                    resetToDefault();
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Reset to default"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editor Tabs Navigation */}
          <EditorTabs />

          {/* Active Tab Panel */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'identity' && <IdentityTab />}
            {activeTab === 'appearance' && <AppearanceTab />}
            {activeTab === 'wardrobe' && <WardrobeTab />}
            {activeTab === 'personality' && <PersonalityTab />}
            {activeTab === 'background' && <BackgroundTab />}
            {activeTab === 'dialogue' && <DialogueTab />}
            {activeTab === 'lorebook' && <LorebookTab />}
            {activeTab === 'advanced' && <AdvancedTab />}
          </div>
        </div>

        {/* Right Sidebar: Token Heatmap & Fast Action Preview */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Token Budget Meter */}
          <TokenHeatmap onOpenAuditor={() => setIsAuditorOpen(true)} />

          {/* Quick Avatar & Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
              {profile.identity.avatarUrl ? (
                <img
                  src={profile.identity.avatarUrl}
                  alt={profile.identity.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950">
                  <span className="text-4xl font-black text-indigo-400">
                    {profile.identity.name.substring(0, 2).toUpperCase() || 'CC'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-2">No Avatar</span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5">
                <div className="text-sm font-bold text-white truncate">{profile.identity.name}</div>
                <div className="text-xs text-indigo-300 truncate">
                  {profile.identity.age ? `${profile.identity.age} y/o ` : ''}
                  {profile.identity.species ? `${profile.identity.species}` : ''}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Card</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <IdeaWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      <TestChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <AuditorModal isOpen={isAuditorOpen} onClose={() => setIsAuditorOpen(false)} />
    </div>
  );
};

export default App;
