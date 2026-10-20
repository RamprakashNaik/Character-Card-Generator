import React from 'react';
import { useCardStore } from '../../store/useCardStore';
import { auditCharacterProfile, autoFixMacros } from '../../utils/linter';
import { analyzeTokenBudget } from '../../utils/tokenCounter';
import { profileToV2Card } from '../../utils/formatters';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Wand2,
  Gauge,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditorModal: React.FC<AuditorModalProps> = ({ isOpen, onClose }) => {
  const { profile, setProfile } = useCardStore();

  if (!isOpen) return null;

  const report = auditCharacterProfile(profile);
  const cardV2 = profileToV2Card(profile);
  const tokenBreakdown = analyzeTokenBudget(cardV2.data);

  const handleAutoFix = () => {
    const fixed = autoFixMacros(profile);
    setProfile(fixed);
  };

  const gradeColors = {
    S: 'from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500/30',
    A: 'from-indigo-500 to-cyan-500 text-indigo-300 border-indigo-500/30',
    B: 'from-blue-500 to-indigo-500 text-blue-300 border-blue-500/30',
    C: 'from-amber-500 to-yellow-500 text-amber-300 border-amber-500/30',
    D: 'from-rose-500 to-red-500 text-rose-300 border-rose-500/30',
  }[report.grade];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Card Quality & Syntax Auditor
              </h2>
              <p className="text-xs text-slate-400">
                6-Point inspection for SillyTavern macro safety, user agency, and token economy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Score Header Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradeColors} border flex flex-col items-center justify-center shadow-lg shrink-0`}>
              <span className="text-2xl font-black">{report.grade}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Grade</span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold text-white">{report.score} / 100</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {report.score >= 85 ? 'Roleplay Ready' : 'Improvements Recommended'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Total Permanent Tokens: <span className="font-mono text-indigo-400 font-bold">{tokenBreakdown.total}</span> (Optimal budget: 800 - 1,600 tokens)
              </p>

              {/* Token Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    tokenBreakdown.status === 'optimal'
                      ? 'bg-emerald-500'
                      : tokenBreakdown.status === 'acceptable'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (tokenBreakdown.total / 2200) * 100)}%` }}
                />
              </div>
            </div>

            {report.issues.some(i => i.fixable) && (
              <button
                type="button"
                onClick={handleAutoFix}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Fix Macros</span>
              </button>
            )}
          </div>

          {/* Section Breakdown Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Token Footprint by Section
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Description</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{tokenBreakdown.description} tokens</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Personality</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{tokenBreakdown.personality} tokens</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">First Message</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{tokenBreakdown.firstMessage} tokens</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Example Dialogues</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{tokenBreakdown.exampleDialogues} tokens</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">Lorebook</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{tokenBreakdown.lorebook} tokens</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">System Directives</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">{tokenBreakdown.systemPrompt} tokens</div>
              </div>
            </div>
          </div>

          {/* Issues / Recommendations */}
          {report.issues.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Issues & Recommendations ({report.issues.length})
              </h4>
              <div className="space-y-2">
                {report.issues.map(issue => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 ${
                      issue.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : issue.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                    }`}
                  >
                    {issue.type === 'error' ? (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : issue.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-xs font-bold">{issue.title}</div>
                      <div className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{issue.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Passing Pro Standards ({report.strengths.length})
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {report.strengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Auditor
          </button>
        </div>
      </div>
    </div>
  );
};
