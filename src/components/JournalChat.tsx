import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  BrainCircuit,
  Save,
  Trash2,
  Edit3,
  CornerDownLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage, PromptStarter, UserProfile } from '../types';
import { PromptStarterBar } from './PromptStarterBar';
import { MoodPicker } from './MoodPicker';
import { formatDate } from '../utils/sanitizer';

interface JournalChatProps {
  user: UserProfile;
  title: string;
  onUpdateTitle: (newTitle: string) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onGenerateSummary: () => void;
  isSummarizing: boolean;
  onSaveEntry: () => void;
  isSaving: boolean;
  onClearSession: () => void;
  hasUnsavedChanges: boolean;
  errorMessage: string | null;
  onRetryLastMessage?: () => void;
  manualMood: string | undefined;
  onSetMood: (mood: string | undefined) => void;
}

export const JournalChat: React.FC<JournalChatProps> = ({
  user,
  title,
  onUpdateTitle,
  messages,
  onSendMessage,
  isLoading,
  onGenerateSummary,
  isSummarizing,
  onSaveEntry,
  isSaving,
  onClearSession,
  hasUnsavedChanges,
  errorMessage,
  onRetryLastMessage,
  manualMood,
  onSetMood,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Keep tempTitle in sync with title prop
  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  const handleTitleSubmit = () => {
    const trimmed = tempTitle.trim();
    if (trimmed) {
      onUpdateTitle(trimmed);
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectStarter = (starter: PromptStarter) => {
    if (messages.length === 0 && (!title || title === 'Untitled Reflection')) {
      onUpdateTitle(starter.suggestedTitle);
    }
    setInputText(starter.initialPrompt);
    textareaRef.current?.focus();
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div id="journal-chat-container" className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full">
      {/* Session Top Bar */}
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 w-full max-w-md">
              <input
                type="text"
                id="input-entry-title"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-purple-500 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Name your reflection..."
              />
              <button
                type="button"
                id="btn-confirm-title"
                onClick={handleTitleSubmit}
                className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h2 id="current-entry-title" className="text-base font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors">
                {title || 'Untitled Reflection'}
              </h2>
              <Edit3 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
              <span className="text-xs text-zinc-500 font-mono">({messages.length} notes)</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Summarize & Brainstorm button */}
          <button
            type="button"
            id="btn-trigger-summarize"
            onClick={onGenerateSummary}
            disabled={isSummarizing || messages.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Generate AI structured summary and brainstorm ideas"
          >
            {isSummarizing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isSummarizing ? 'Synthesizing...' : 'Summarize & Brainstorm'}</span>
          </button>

          {/* Manual Mood Picker (falls back to AI-derived emotionalTone when unset) */}
          <MoodPicker selectedMood={manualMood} onSelectMood={onSetMood} />

          {/* Save to Firestore */}
          <button
            type="button"
            id="btn-save-session"
            onClick={onSaveEntry}
            disabled={isSaving || messages.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              hasUnsavedChanges
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Entry'}</span>
          </button>

          {/* Clear Session */}
          {messages.length > 0 && (
            <button
              type="button"
              id="btn-clear-session"
              onClick={onClearSession}
              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors"
              title="Clear current dialogue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div id="chat-messages-scroll" className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto py-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Welcome to your Reflection Canvas
              </h3>
              <p className="text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
                Share what's on your mind today. Gemini 3.6 Flash will help you reflect, brainstorm solutions, and synthesize your thoughts.
              </p>
            </div>

            {/* Prompt Starter Section */}
            <PromptStarterBar onSelectStarter={handleSelectStarter} />
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              id={`message-${msg.id}`}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div className="shrink-0">
                {msg.role === 'user' ? (
                  user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-semibold">
                      <User className="w-4 h-4" />
                    </div>
                  )
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-900/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`group relative rounded-2xl p-4 text-sm leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-purple-950/50 text-purple-100 border-purple-800/60 rounded-tr-sm'
                    : 'bg-zinc-900/90 text-zinc-100 border-zinc-800/90 rounded-tl-sm backdrop-blur-sm'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-zinc-800/50 text-[11px] text-zinc-400">
                  <span className="font-semibold text-zinc-300">
                    {msg.role === 'user' ? user.displayName || 'You' : 'Gemini Companion'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{formatDate(msg.timestamp)}</span>
                    <button
                      type="button"
                      id={`btn-copy-${msg.id}`}
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-white rounded transition-opacity"
                      title="Copy text"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Body Text */}
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <div className="markdown-body space-y-2">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator Bubble */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 text-zinc-400 text-sm flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              </div>
              <span className="text-xs text-zinc-400">Gemini is reflecting on your thoughts...</span>
            </div>
          </div>
        )}

        {/* Error Alert inside stream */}
        {errorMessage && (
          <div
            id="chat-error-banner"
            className="max-w-xl mx-auto p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-white">Generation Issue</div>
              <div className="text-xs text-rose-300 mt-0.5">{errorMessage}</div>
              {onRetryLastMessage && (
                <button
                  type="button"
                  id="btn-retry-chat"
                  onClick={onRetryLastMessage}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Prompt
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 focus-within:border-purple-500/80 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all p-2">
            <textarea
              ref={textareaRef}
              id="input-chat-prompt"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Reflect on your day, describe a challenge, or ask Gemini to brainstorm..."
              rows={2}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none px-2 py-1 max-h-44"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between pt-2 px-2 border-t border-zinc-800/60">
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono text-[10px]">
                  Enter ↵
                </kbd>
                <span>to reflect,</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono text-[10px]">
                  Shift+Enter
                </kbd>
                <span>for line break</span>
              </span>

              <button
                type="button"
                id="btn-send-message"
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-all shadow-md shadow-purple-900/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Reflect</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
