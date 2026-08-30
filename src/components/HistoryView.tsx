import React, { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  MessageSquare,
  Sparkles,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  BrainCircuit,
  Copy,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { JournalEntry } from '../types';
import { formatDate } from '../utils/sanitizer';
import Markdown from 'react-markdown';

interface HistoryViewProps {
  entries: JournalEntry[];
  isLoading: boolean;
  onLoadEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onStartNewEntry: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  entries,
  isLoading,
  onLoadEntry,
  onDeleteEntry,
  onStartNewEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter entries based on search
  const filteredEntries = entries.filter((entry) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;

    const inTitle = entry.title.toLowerCase().includes(q);
    const inThemes = entry.summary?.keyThemes.some((t) => t.toLowerCase().includes(q));
    const inOverview = entry.summary?.overview.toLowerCase().includes(q);
    const inMessages = entry.messages.some((m) => m.text.toLowerCase().includes(q));

    return inTitle || inThemes || inOverview || inMessages;
  });

  const exportAsMarkdown = (entry: JournalEntry) => {
    let content = `# ${entry.title}\n\n`;
    content += `**Date:** ${formatDate(entry.createdAt)}\n`;
    content += `**Messages:** ${entry.messages.length}\n\n`;

    if (entry.summary) {
      content += `## AI Reflection Summary\n\n`;
      content += `${entry.summary.overview}\n\n`;
      content += `**Emotional Tone:** ${entry.summary.emotionalTone}\n`;
      content += `**Mindset Index:** ${entry.summary.mindsetScore ?? 7}/10\n\n`;

      content += `### Key Themes\n`;
      entry.summary.keyThemes.forEach((t) => (content += `- ${t}\n`));
      content += `\n`;

      content += `### Actionable Takeaways\n`;
      entry.summary.actionableTakeaways.forEach((a) => (content += `- [ ] ${a}\n`));
      content += `\n`;

      content += `### Brainstorming Angles\n`;
      entry.summary.brainstormIdeas.forEach((b) => (content += `- ${b}\n`));
      content += `\n`;
    }

    content += `## Full Conversation Transcript\n\n`;
    entry.messages.forEach((m) => {
      content += `### ${m.role === 'user' ? 'Journaler' : 'Gemini Companion'} (${formatDate(m.timestamp)})\n\n`;
      content += `${m.text}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reflection.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyTranscript = (entry: JournalEntry) => {
    const text = entry.messages
      .map((m) => `${m.role === 'user' ? 'You' : 'Gemini'}: ${m.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="history-view-container" className="max-w-5xl mx-auto py-8 px-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <History className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Past Reflections History
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Persisted securely in your user-isolated Firestore collection
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-history"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, themes, notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Fetching your reflections from Firestore...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">
            {searchQuery ? 'No matching reflections found' : 'No reflections saved yet'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try refining your search keyword or clearing the filter.'
              : 'Complete a journal reflection with Gemini and click "Save to Firestore" to build your history.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              id="btn-start-first-entry"
              onClick={onStartNewEntry}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Start a New Reflection
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              id={`history-item-${entry.id}`}
              className="group bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 sm:p-5 transition-all shadow-md backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                      {entry.title}
                    </h3>
                    {entry.summary && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <BrainCircuit className="w-3 h-3" /> Summarized
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {formatDate(entry.updatedAt || entry.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                      {entry.messages.length} notes
                    </span>
                    {entry.summary?.emotionalTone && (
                      <span className="text-purple-300">
                        • {entry.summary.emotionalTone}
                      </span>
                    )}
                  </div>

                  {/* Overview Snippet */}
                  {entry.summary?.overview && (
                    <p className="text-xs text-zinc-300 mt-2 line-clamp-2 leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/50">
                      {entry.summary.overview}
                    </p>
                  )}

                  {/* Themes */}
                  {entry.summary?.keyThemes && entry.summary.keyThemes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.summary.keyThemes.slice(0, 4).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-zinc-950 text-zinc-400 border border-zinc-800"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    id={`btn-view-details-${entry.id}`}
                    onClick={() => setSelectedEntry(entry)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
                    title="View full transcript and insights modal"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    id={`btn-load-into-chat-${entry.id}`}
                    onClick={() => onLoadEntry(entry)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                    title="Load reflection into active workspace"
                  >
                    <span>Open in Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    id={`btn-export-md-${entry.id}`}
                    onClick={() => exportAsMarkdown(entry)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    title="Export as Markdown (.md)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    id={`btn-delete-entry-${entry.id}`}
                    onClick={() => setEntryToDelete(entry)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Delete reflection from Firestore"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedEntry.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {formatDate(selectedEntry.createdAt)} • {selectedEntry.messages.length} notes
                </p>
              </div>
              <button
                type="button"
                id="btn-close-modal"
                onClick={() => setSelectedEntry(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Summary if available */}
              {selectedEntry.summary && (
                <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> AI Reflection Synthesis
                  </div>
                  <p className="text-zinc-200 leading-relaxed text-xs sm:text-sm">
                    {selectedEntry.summary.overview}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-purple-300 font-medium">
                    <span>Tone: {selectedEntry.summary.emotionalTone}</span>
                    <span>Mindset Index: {selectedEntry.summary.mindsetScore ?? 7}/10</span>
                  </div>
                </div>
              )}

              {/* Conversation Log */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Full Reflection Dialogue
                </h4>
                {selectedEntry.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl text-xs sm:text-sm ${
                      m.role === 'user'
                        ? 'bg-purple-950/40 border border-purple-800/50 text-purple-100 ml-4'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-200 mr-4'
                    }`}
                  >
                    <div className="font-semibold text-zinc-400 text-[11px] mb-1">
                      {m.role === 'user' ? 'Journaler' : 'Gemini 3.6 Flash'}
                    </div>
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    ) : (
                      <div className="markdown-body">
                        <Markdown>{m.text}</Markdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between gap-2 bg-zinc-950/60">
              <button
                type="button"
                id="btn-copy-modal-transcript"
                onClick={() => copyTranscript(selectedEntry)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200"
              >
                {copiedId === selectedEntry.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === selectedEntry.id ? 'Copied' : 'Copy Dialogue'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-export-modal-md"
                  onClick={() => exportAsMarkdown(selectedEntry)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>

                <button
                  type="button"
                  id="btn-open-from-modal"
                  onClick={() => {
                    onLoadEntry(selectedEntry);
                    setSelectedEntry(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white"
                >
                  <span>Open in Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white text-center">Delete Reflection?</h3>
            <p className="text-xs text-zinc-400 mt-2 text-center">
              Are you sure you want to delete <span className="text-white font-semibold">"{entryToDelete.title}"</span>? This will permanently remove it from your Firestore database.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                id="btn-cancel-delete"
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                onClick={() => {
                  onDeleteEntry(entryToDelete.id);
                  setEntryToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Delete from Firestore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
