import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { profileToV2Card } from '../../utils/formatters';
import { analyzeTokenBudget, TARGET_BUDGET, MAX_RECOMMENDED_BUDGET } from '../../utils/tokenCounter';
import { auditCharacterProfile } from '../../utils/linter';
import { ShieldCheck, ChevronDown, ChevronUp, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

interface TokenHeatmapProps {
  onOpenAuditor: () => void;
}

export const TokenHeatmap: React.FC<TokenHeatmapProps> = ({ onOpenAuditor }) => {
  const { profile, formattingStyle } = useCardStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const cardV2 = profileToV2Card(profile, formattingStyle);
  const tokenBreakdown = analyzeTokenBudget(cardV2.data);
  const report = auditCharacterProfile(profile);

  const statusColor = {
    optimal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    acceptable: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    warning: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    under: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  }[tokenBreakdown.status];

  const barColor = {
    optimal: 'bg-emerald-500',
    acceptable: 'bg-amber-500',
    warning: 'bg-rose-500',
    under: 'bg-blue-500',
  }[tokenBreakdown.status];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Token summary */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Permanent Tokens
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                {tokenBreakdown.status === 'optimal'
                  ? 'Optimal'
                  : tokenBreakdown.status === 'acceptable'
                  ? 'High'
                  : tokenBreakdown.status === 'warning'
                  ? 'Bloat Risk'
                  : 'Sparse'}
              </span>
            </div>
            <div className="text-lg font-black font-mono text-white flex items-baseline gap-1 mt-0.5">
              <span>{tokenBreakdown.total}</span>
              <span className="text-xs font-normal text-slate-500">/ {TARGET_BUDGET} target</span>
            </div>
          </div>
        </div>

        {/* Audit Score Pill & Expand button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAuditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Score: {report.score} ({report.grade})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800/80">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, (tokenBreakdown.total / MAX_RECOMMENDED_BUDGET) * 100)}%` }}
        />
      </div>

      {/* Expanded Breakdown */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/60">
            <span className="text-[10px] text-slate-400">Description</span>
            <div className="font-mono font-bold text-white mt-0.5">{tokenBreakdown.description} tokens</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/60">
            <span className="text-[10px] text-slate-400">Personality</span>
            <div className="font-mono font-bold text-white mt-0.5">{tokenBreakdown.personality} tokens</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/60">
            <span className="text-[10px] text-slate-400">First Message</span>
            <div className="font-mono font-bold text-white mt-0.5">{tokenBreakdown.firstMessage} tokens</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/60">
            <span className="text-[10px] text-slate-400">Example Dialogues</span>
            <div className="font-mono font-bold text-white mt-0.5">{tokenBreakdown.exampleDialogues} tokens</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/60">
            <span className="text-[10px] text-slate-400">Lorebook</span>
            <div className="font-mono font-bold text-white mt-0.5">{tokenBreakdown.lorebook} tokens</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/60">
            <span className="text-[10px] text-slate-400">Directives</span>
            <div className="font-mono font-bold text-white mt-0.5">{tokenBreakdown.systemPrompt} tokens</div>
          </div>
        </div>
      )}
    </div>
  );
};
