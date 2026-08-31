import React from 'react';
import { MOOD_OPTIONS } from '../data/moodOptions';

interface MoodPickerProps {
  selectedMood: string | undefined;
  onSelectMood: (mood: string | undefined) => void;
}

export const MoodPicker: React.FC<MoodPickerProps> = ({ selectedMood, onSelectMood }) => {
  return (
    <div id="mood-picker" className="flex items-center gap-1" role="group" aria-label="Pick your mood for this entry">
      {MOOD_OPTIONS.map((mood) => {
        const isSelected = selectedMood === mood.label;
        return (
          <button
            key={mood.id}
            type="button"
            id={`mood-option-${mood.id}`}
            onClick={() => onSelectMood(isSelected ? undefined : mood.label)}
            title={mood.label}
            aria-pressed={isSelected}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all border ${
              isSelected
                ? 'bg-purple-600/30 border-purple-500 scale-110'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 opacity-70 hover:opacity-100'
            }`}
          >
            <span aria-hidden="true">{mood.emoji}</span>
            <span className="sr-only">{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
};
