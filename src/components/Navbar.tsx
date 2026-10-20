import React, { useState, useRef } from 'react';
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
  X,
  MoreVertical,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-xs sm:text-base tracking-tight text-white truncate">
                <span className="sm:hidden">Card Studio</span>
                <span className="hidden sm:inline">Character Card Studio</span>
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

        {/* Model Badge (Desktop only) */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-xs font-mono group shrink-0"
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-400 group-hover:animate-pulse" />
          <span className="max-w-[130px] truncate">{settings.model || 'Select Model'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
            {settings.provider}
          </span>
        </button>

        {/* Desktop Actions Toolbar (hidden on small mobile screens < 640px) */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Idea Wizard Button */}
          <button
            type="button"
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Idea to Card</span>
          </button>

          {/* Global Refine Button */}
          <button
            type="button"
            onClick={onOpenGlobalRefine}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 hover:text-white font-semibold text-xs border border-purple-500/40 shadow-sm transition-all shrink-0"
            title="Describe improvements to automatically edit affected sections"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Refine Card</span>
          </button>

          {/* Test Chat Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Chat</span>
          </button>

          {/* Import Button */}
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors shrink-0"
            title="Import SillyTavern PNG or JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import</span>
          </button>

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

        {/* Mobile Actions Toolbar (< 640px) */}
        <div className="flex sm:hidden items-center gap-1 shrink-0">
          {/* Mobile Refine Button (Primary) */}
          <button
            type="button"
            onClick={onOpenGlobalRefine}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-sm transition-all shrink-0"
            title="Refine character with AI"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Refine</span>
          </button>

          {/* Mobile Chat Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className="p-2 rounded-xl bg-slate-800 text-cyan-400 hover:text-white border border-slate-700/80 transition-colors shrink-0"
            title="Test Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Mobile Export Button */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all shrink-0"
            title="Export SillyTavern Card"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
          </button>
        </div>

        {/* Hidden File Import Input */}
        <input
          ref={importInputRef}
          type="file"
          accept=".png,.json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>

      {/* Mobile Dropdown Action Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-900/98 px-3 py-3 space-y-2 animate-in slide-in-from-top-2 shadow-2xl">
          {/* Active Model Info */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenSettings();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-left"
          >
            <div className="flex items-center gap-2 text-slate-300">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="font-mono truncate">{settings.model || 'Configure Model'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
              {settings.provider}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Idea Wizard Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenWizard();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 text-left"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Idea to Card</span>
            </button>

            {/* Import Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                importInputRef.current?.click();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 text-left"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Import Card</span>
            </button>

            {/* Auditor Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuditor();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 text-left"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Card Auditor</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 text-left"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
