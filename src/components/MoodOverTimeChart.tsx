import React from 'react';
import { Smile } from 'lucide-react';
import { JournalEntry } from '../types';
import { MOOD_OPTIONS, findMoodOption } from '../data/moodOptions';
import { formatDate } from '../utils/sanitizer';

interface MoodOverTimeChartProps {
  entries: JournalEntry[];
}

export const MoodOverTimeChart: React.FC<MoodOverTimeChartProps> = ({ entries }) => {
  const chartable = entries
    .map((entry) => ({ entry, mood: findMoodOption(entry.mood) }))
    .filter((item) => item.mood !== null)
    .sort(
      (a, b) =>
        new Date(a.entry.updatedAt || a.entry.createdAt).getTime() -
        new Date(b.entry.updatedAt || b.entry.createdAt).getTime()
    )
    .slice(-14);

  const skippedCount = entries.length - chartable.length;

  return (
    <div id="mood-over-time-chart" className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Smile className="w-4 h-4" />
        </span>
        <h3 className="text-base font-bold text-white">Mood Over Time</h3>
      </div>
      <p className="text-xs text-zinc-400 mb-5">
        Based on the mood you picked (or Gemini's detected tone) across your saved reflections
      </p>

      {chartable.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500">
          No chartable moods yet. Pick a mood next to "Save Entry" to start tracking it here.
        </div>
      ) : (
        <>
          <div id="mood-chart-bars" className="flex items-end gap-2.5 h-40 overflow-x-auto pb-1">
            {chartable.map(({ entry, mood }) => (
              <div
                key={entry.id}
                title={`${mood.label} • ${formatDate(entry.updatedAt || entry.createdAt)}`}
                className="flex flex-col items-center justify-end gap-1.5 shrink-0 w-9 h-full group"
              >
                <span className="text-sm">{mood.emoji}</span>
                <div
                  className="w-4 rounded-t-md transition-all group-hover:opacity-80"
                  style={{
                    height: `${(mood.value / 6) * 100}%`,
                    minHeight: '6px',
                    backgroundColor: mood.color,
                  }}
                />
                <span className="text-[9px] text-zinc-500 font-mono whitespace-nowrap -rotate-45 origin-top-left translate-y-2">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
                    new Date(entry.updatedAt || entry.createdAt)
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-zinc-800/70">
            {MOOD_OPTIONS.map((m) => (
              <span key={m.id} className="flex items-center gap-1 text-[10px] text-zinc-400">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: m.color }} />
                {m.emoji} {m.label}
              </span>
            ))}
          </div>

          {skippedCount > 0 && (
            <p className="text-[10px] text-zinc-500 mt-3">
              {skippedCount} other saved {skippedCount === 1 ? 'entry has' : 'entries have'} no matching mood and{' '}
              {skippedCount === 1 ? "isn't" : "aren't"} shown above.
            </p>
          )}
        </>
      )}
    </div>
  );
};
