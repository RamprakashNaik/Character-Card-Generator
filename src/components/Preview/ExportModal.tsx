import React, { useState } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { profileToV2Card } from '../../utils/formatters';
import { embedCharacterInPng, createPlaceholderAvatar } from '../../utils/pngMetadata';
import { FormattingStyle } from '../../types/sillytavern';
import {
  Download,
  X,
  FileCode,
  Image as ImageIcon,
  Copy,
  Check,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { profile, formattingStyle, setFormattingStyle } = useCardStore();

  const [activeTab, setActiveTab] = useState<'png' | 'json' | 'preview'>('png');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const cardV2 = profileToV2Card(profile, formattingStyle);
  const jsonString = JSON.stringify(cardV2, null, 2);

  const cleanFilename = (profile.identity.name || 'Character')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFilename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      let imageBytes: Uint8Array;

      if (profile.identity.avatarUrl && profile.identity.avatarUrl.startsWith('data:image/')) {
        // Convert base64 data URL to Uint8Array
        const base64Data = profile.identity.avatarUrl.split(',')[1];
        const binary = atob(base64Data);
        imageBytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          imageBytes[i] = binary.charCodeAt(i);
        }

        // If it's a JPEG or WebP, convert to PNG via Canvas first
        if (!profile.identity.avatarUrl.startsWith('data:image/png')) {
          const img = new Image();
          img.src = profile.identity.avatarUrl;
          await new Promise(res => (img.onload = res));

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 512;
          canvas.height = img.naturalHeight || 512;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);

          const pngBlob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
          if (pngBlob) {
            const buf = await pngBlob.arrayBuffer();
            imageBytes = new Uint8Array(buf);
          }
        }
      } else {
        // Create high-res placeholder avatar
        imageBytes = await createPlaceholderAvatar(
          profile.identity.name,
          profile.identity.archetype
        );
      }

      // Inject V2 JSON into PNG chara chunk
      const finalPngBytes = embedCharacterInPng(imageBytes, cardV2);

      // Download
      const blob = new Blob([finalPngBytes as any], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanFilename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PNG export failed:', err);
      alert(`PNG export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Export Character Card
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SillyTavern V2 Spec
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ready for SillyTavern, TavernAI, Chub.ai, Agnaistic, and OpenRouter
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

        {/* Format Selector Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Formatting Style:</span>
            {(['natural', 'boostily', 'wpp'] as FormattingStyle[]).map(style => (
              <button
                key={style}
                type="button"
                onClick={() => setFormattingStyle(style)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  formattingStyle === style
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                {style === 'natural' ? 'Natural (Plauto)' : style === 'boostily' ? 'Ali:Chat / Boostily' : 'W++'}
              </button>
            ))}
          </div>

          {/* Sub tabs */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('png')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'png' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              PNG Card
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'json' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              JSON Card
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw Preview
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'png' && (
            <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
              <div className="relative group">
                {profile.identity.avatarUrl ? (
                  <img
                    src={profile.identity.avatarUrl}
                    alt={profile.identity.name}
                    className="w-48 h-48 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-500/40 flex flex-col items-center justify-center p-4 shadow-xl">
                    <span className="text-4xl font-black text-indigo-300">
                      {profile.identity.name.substring(0, 2).toUpperCase() || 'CC'}
                    </span>
                    <span className="text-xs font-bold text-white mt-2 truncate max-w-full">
                      {profile.identity.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">
                      {profile.identity.archetype}
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-2xl">
                  <div className="text-xs font-bold text-white">{profile.identity.name}</div>
                  <div className="text-[10px] text-indigo-300 font-mono">Embedded chara chunk</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">SillyTavern V2 PNG Format</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Downloads an image with the character card data seamlessly embedded into the PNG metadata.
                  Simply drag & drop this file into SillyTavern or TavernAI to import.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExporting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating PNG...' : `Download ${cleanFilename}.png`}</span>
              </button>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-lg">
                <FileCode className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">Standard SillyTavern V2 JSON</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Export as a clean JSON file compliant with SillyTavern V2 character specs, including world lorebook, alternate greetings, and system directives.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {cleanFilename}.json</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied JSON!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  spec: chara_card_v2 | version: 2.0
                </span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[50vh] leading-relaxed">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
