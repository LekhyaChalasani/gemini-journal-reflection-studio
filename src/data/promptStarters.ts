import { PromptStarter } from '../types';

export const PROMPT_STARTERS: PromptStarter[] = [
  {
    id: 'mindfulness',
    title: 'Daily Mindfulness & Grounding',
    category: 'mindfulness',
    description: 'Tune into your current emotional state and physical sensations.',
    initialPrompt: 'I want to do a mindful check-in. Right now, what is occupying my mind most is...',
    suggestedTitle: 'Daily Mindfulness Check-in',
  },
  {
    id: 'brainstorming',
    title: 'Idea Incubation & Brainstorming',
    category: 'creativity',
    description: 'Brainstorm creative angles, evaluate trade-offs, and map out concepts.',
    initialPrompt: "I have a project idea I'd love to brainstorm and explore from multiple angles. Here is the premise: ",
    suggestedTitle: 'Creative Brainstorming Session',
  },
  {
    id: 'decision-making',
    title: 'Unblocking a Difficult Decision',
    category: 'productivity',
    description: 'Weigh options, clarify values, and reduce decision fatigue.',
    initialPrompt: "I'm feeling conflicted about a choice I need to make. The two paths I'm considering are...",
    suggestedTitle: 'Decision Clarity Reflection',
  },
  {
    id: 'weekly-review',
    title: 'Weekly Wins & Learnings',
    category: 'growth',
    description: 'Review the past few days, celebrate progress, and identify areas to calibrate.',
    initialPrompt: "Let's do a weekly reflection. Some of the high points and unexpected challenges this week were...",
    suggestedTitle: 'Weekly Growth & Retrospective',
  },
  {
    id: 'gratitude',
    title: 'Gratitude & Decompression',
    category: 'relationships',
    description: 'Reflect on moments of appreciation, calm, and connection.',
    initialPrompt: 'To decompress today, I want to reflect on three things that brought a sense of gratitude or peace: ',
    suggestedTitle: 'Evening Gratitude & Peace',
  },
];
