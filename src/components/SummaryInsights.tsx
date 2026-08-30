import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  HeartHandshake,
  RefreshCw,
  Save,
  MessageSquarePlus,
  BookOpen,
} from 'lucide-react';
import { JournalSummary, JournalEntry } from '../types';

interface SummaryInsightsProps {
  summary: JournalSummary | undefined;
  entry: JournalEntry;
  onGenerateSummary: () => void;
  isSummarizing: boolean;
  onSaveEntry: () => void;
  isSaving: boolean;
  onInjectQuestionIntoChat: (question: string) => void;
  onSwitchToChat: () => void;
}

export const SummaryInsights: React.FC<SummaryInsightsProps> = ({
  summary,
  entry,
  onGenerateSummary,
  isSummarizing,
  onSaveEntry,
  isSaving,
  onInjectQuestionIntoChat,
  onSwitchToChat,
}) => {
  if (!summary) {
    return (
      <div id="empty-summary-view" className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 sm:p-12 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">
            No Summary Generated Yet
          </h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            Gemini 3.6 Flash can analyze your reflection dialogue, extract key themes, identify emotional tone, synthesize actionable takeaways, and brainstorm next steps.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              id="btn-generate-initial-summary"
              onClick={onGenerateSummary}
              disabled={isSummarizing || entry.messages.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSummarizing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isSummarizing ? 'Synthesizing Reflection...' : 'Generate AI Summary & Brainstorm'}</span>
            </button>

            {entry.messages.length === 0 && (
              <button
                type="button"
                id="btn-return-to-chat"
                onClick={onSwitchToChat}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Write Notes in Journal First</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const mindsetScore = summary.mindsetScore ?? 7;

  return (
    <div id="summary-insights-container" className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Top Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <BrainCircuit className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Reflection Summary & Brainstorming
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Synthesized by Gemini 3.6 Flash from "{entry.title}" ({entry.messages.length} notes)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-refresh-summary"
              onClick={onGenerateSummary}
              disabled={isSummarizing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
              <span>{isSummarizing ? 'Re-analyzing...' : 'Refresh Summary'}</span>
            </button>

            <button
              type="button"
              id="btn-save-summary"
              onClick={onSaveEntry}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save to Firestore'}</span>
            </button>
          </div>
        </div>

        {/* Overview Box */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Synthesis Overview
          </h3>
          <p id="summary-overview-text" className="text-zinc-200 text-sm leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
            {summary.overview}
          </p>
        </div>

        {/* Score & Tone Metrics */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Emotional Tone</div>
              <div id="summary-emotional-tone" className="text-sm font-semibold text-purple-300 mt-0.5">
                {summary.emotionalTone}
              </div>
            </div>
            <HeartHandshake className="w-6 h-6 text-purple-400/60" />
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Mindset Clarity Index</span>
              <span id="summary-mindset-score" className="font-bold text-amber-400 font-mono">
                {mindsetScore} / 10
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(mindsetScore * 10, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Themes */}
        {summary.keyThemes && summary.keyThemes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Key Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.keyThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-950/60 text-purple-200 border border-purple-800/60"
                >
                  #{theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Actionable Takeaways & Brainstorming Ideas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actionable Takeaways */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">Actionable Takeaways</h3>
          </div>

          <ul className="space-y-2.5 flex-1">
            {summary.actionableTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 text-xs text-zinc-200 leading-relaxed"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  {idx + 1}
                </div>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Brainstorming Ideas */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lightbulb className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">Brainstorming Angles</h3>
          </div>

          <ul className="space-y-2.5 flex-1">
            {summary.brainstormIdeas.map((idea, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 text-xs text-zinc-200 leading-relaxed"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Deep Reflection Questions */}
      {summary.reflectionQuestions && summary.reflectionQuestions.length > 0 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <HelpCircle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Deep Reflection Questions</h3>
              <p className="text-xs text-zinc-400">
                Click any question to inject it directly into your reflection chat
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.reflectionQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                id={`btn-inject-question-${idx}`}
                onClick={() => onInjectQuestionIntoChat(q)}
                className="group flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-sky-500/50 transition-all text-left cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-300 group-hover:text-white leading-relaxed">
                  "{q}"
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
