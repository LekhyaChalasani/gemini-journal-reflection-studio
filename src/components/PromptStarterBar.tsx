import React from 'react';
import { PROMPT_STARTERS } from '../data/promptStarters';
import { PromptStarter } from '../types';
import { Sparkles, Compass, Lightbulb, Target, Heart } from 'lucide-react';

interface PromptStarterBarProps {
  onSelectStarter: (starter: PromptStarter) => void;
}

export const PromptStarterBar: React.FC<PromptStarterBarProps> = ({ onSelectStarter }) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'mindfulness':
        return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
      case 'creativity':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-400" />;
      case 'productivity':
        return <Target className="w-3.5 h-3.5 text-sky-400" />;
      case 'growth':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'relationships':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div id="prompt-starters-section" className="mb-6">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span>Inspiration Starters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {PROMPT_STARTERS.map((starter) => (
          <button
            key={starter.id}
            type="button"
            id={`btn-starter-${starter.id}`}
            onClick={() => onSelectStarter(starter)}
            className="group flex flex-col items-start p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                {getCategoryIcon(starter.category)}
              </span>
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                {starter.title}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
              {starter.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
