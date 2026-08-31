export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  value: number;
  color: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'happy', label: 'Happy', emoji: '😄', value: 6, color: '#34d399' },
  { id: 'calm', label: 'Calm', emoji: '😌', value: 5, color: '#38bdf8' },
  { id: 'neutral', label: 'Neutral', emoji: '😐', value: 4, color: '#a1a1aa' },
  { id: 'sad', label: 'Sad', emoji: '😢', value: 3, color: '#818cf8' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤', value: 2, color: '#fb923c' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', value: 1, color: '#f87171' },
  ];

export function findMoodOption(mood) {
  if (!mood) return null;
  const normalized = mood.trim().toLowerCase();
  return MOOD_OPTIONS.find((m) => m.label.toLowerCase() === normalized || m.id === normalized) || null;
}
