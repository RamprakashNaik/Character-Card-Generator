import React, { useState, useRef, useEffect } from 'react';
import { useCardStore } from '../../store/useCardStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { streamChatCompletion } from '../../services/aiClient';
import { buildSandboxChatMessages } from '../../services/prompts';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  User,
  Bot,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface TestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
}

export const TestChatModal: React.FC<TestChatModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useCardStore();
  const { settings } = useSettingsStore();

  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedChunk, setStreamedChunk] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with character's first message
  useEffect(() => {
    if (isOpen && messages.length === 0 && profile.scenario.firstMessage) {
      setMessages([
        {
          role: 'assistant',
          content: profile.scenario.firstMessage,
        },
      ]);
    }
  }, [isOpen, profile.scenario.firstMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedChunk]);

  if (!isOpen) return null;

  const handleResetChat = () => {
    setMessages(
      profile.scenario.firstMessage
        ? [{ role: 'assistant', content: profile.scenario.firstMessage }]
        : []
    );
    setStreamedChunk('');
    setError(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = userInput.trim();
    if (!text || isStreaming) return;

    if (!settings.baseUrl) {
      setError('AI Base URL is not configured. Please open Settings.');
      return;
    }

    const updatedMessages: ChatEntry[] = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setUserInput('');
    setIsStreaming(true);
    setStreamedChunk('');
    setError(null);

    const apiMessages = buildSandboxChatMessages(profile, updatedMessages);
    let fullReply = '';

    try {
      await streamChatCompletion(
        settings,
        apiMessages,
        chunk => {
          fullReply += chunk;
          setStreamedChunk(fullReply);
        }
      );

      setMessages([...updatedMessages, { role: 'assistant', content: fullReply }]);
      setStreamedChunk('');
    } catch (err: any) {
      setError(err.message || 'Failed to get character response');
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl h-[94vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            {profile.identity.avatarUrl ? (
              <img
                src={profile.identity.avatarUrl}
                alt={profile.identity.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-sm">
                {profile.identity.name.substring(0, 2).toUpperCase() || 'CC'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                  {profile.identity.name || 'Character'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 hidden sm:inline-block">
                  Live Test Sandbox
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-md">
                {profile.identity.archetype || 'Roleplay character voice verification'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => {
            const isChar = m.role === 'assistant';
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                  isChar ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    isChar
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                      : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {isChar ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isChar
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {/* Currently streaming reply */}
          {isStreaming && (
            <div className="flex gap-3 max-w-[92%] sm:max-w-[85%] mr-auto animate-in fade-in">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/40 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                {streamedChunk || (
                  <span className="text-slate-500 italic flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    {profile.identity.name} is typing...
                  </span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/95 shrink-0 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            disabled={isStreaming}
            placeholder={`Say something or roleplay with ${profile.identity.name}...`}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isStreaming || !userInput.trim()}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-40 shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
