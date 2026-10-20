import React from 'react';
import { useCardStore, TabKey } from '../../store/useCardStore';
import {
  User,
  Eye,
  Shirt,
  Heart,
  BookOpen,
  MessageSquare,
  Globe,
  Sliders,
} from 'lucide-react';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const TABS: TabItem[] = [
  { key: 'identity', label: 'Identity', icon: User },
  { key: 'appearance', label: 'How They Look', icon: Eye },
  { key: 'wardrobe', label: 'What They Wear', icon: Shirt },
  { key: 'personality', label: 'Personality & Voice', icon: Heart },
  { key: 'background', label: 'Background & Lore', icon: BookOpen },
  { key: 'dialogue', label: 'Dialogue & Greetings', icon: MessageSquare },
  { key: 'lorebook', label: 'World Lorebook', icon: Globe },
  { key: 'advanced', label: 'Directives', icon: Sliders },
];

export const EditorTabs: React.FC = () => {
  const { activeTab, setActiveTab, profile } = useCardStore();

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const loreCount = tab.key === 'lorebook' ? profile.lorebook.length : 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {loreCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {loreCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
