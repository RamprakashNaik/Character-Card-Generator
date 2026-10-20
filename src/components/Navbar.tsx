import React, { useRef } from 'react';
import { useCardStore } from '../store/useCardStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { extractCharacterFromPng } from '../utils/pngMetadata';
import { v2CardToProfile } from '../utils/formatters';
import {
  Sparkles,
  Wand2,
  Download,
  Upload,
  Settings,
  MessageSquare,
  ShieldCheck,
  Cpu,
  Layers,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenWizard: () => void;
  onOpenGlobalRefine: () => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
  onOpenAuditor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenWizard,
  onOpenGlobalRefine,
  onOpenChat,
  onOpenExport,
  onOpenAuditor,
}) => {
  const { setProfile, profile } = useCardStore();
  const { settings } = useSettingsStore();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.toLowerCase().endsWith('.png')) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const extracted = extractCharacterFromPng(uint8);

        if (!extracted) {
          alert('Could not find SillyTavern character card metadata in this PNG file.');
          return;
        }

        // Also convert the image to data URL for avatar preview
        const reader = new FileReader();
        reader.onload = () => {
          const avatarUrl = typeof reader.result === 'string' ? reader.result : '';
          const newProfile = v2CardToProfile(extracted, avatarUrl);
          setProfile(newProfile);
          alert(`Successfully imported "${newProfile.identity.name}" from PNG!`);
        };
        reader.readAsDataURL(file);
      } else if (file.name.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        const newProfile = v2CardToProfile(json);
        setProfile(newProfile);
        alert(`Successfully imported "${newProfile.identity.name}" from JSON!`);
      } else {
        alert('Please select a .png or .json character card file.');
      }
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base tracking-tight text-white">
                Character Card Studio
              </span>
              <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                SillyTavern V2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              OpenAI-Compatible Character Architect
            </p>
          </div>
        </div>

        {/* Model Badge (Clickable to open settings) */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-xs font-mono group"
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400 group-hover:animate-pulse" />
          <span className="max-w-[150px] truncate">{settings.model || 'Select Model'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
            {settings.provider}
          </span>
        </button>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Idea Wizard Button */}
          <button
            type="button"
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Idea to Card</span>
            <span className="sm:hidden">Idea</span>
          </button>

          {/* Global Refine Button */}
          <button
            type="button"
            onClick={onOpenGlobalRefine}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 hover:text-white font-semibold text-xs border border-purple-500/40 shadow-sm transition-all shrink-0"
            title="Describe improvements to automatically edit affected sections"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Refine Card</span>
            <span className="sm:hidden">Refine</span>
          </button>

          {/* Test Chat Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Live Chat</span>
          </button>

          {/* Import Button */}
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors shrink-0"
            title="Import SillyTavern PNG or JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".png,.json"
            onChange={handleImportFile}
            className="hidden"
          />

          {/* Export Button */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
