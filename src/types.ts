/**
 * Type definitions for Gemini Journal & Reflection Studio
 */

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}

export interface JournalSummary {
  overview: string;
  keyThemes: string[];
  emotionalTone: string;
  mindsetScore?: number; // 1 to 10 scale of clarity/calm
  actionableTakeaways: string[];
  reflectionQuestions: string[];
  brainstormIdeas: string[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  summary?: JournalSummary;
  tags: string[];
  mood?: string;
  status: 'active' | 'saved' | 'archived';
}

export interface PromptStarter {
  id: string;
  title: string;
  category: 'mindfulness' | 'productivity' | 'creativity' | 'growth' | 'relationships';
  description: string;
  initialPrompt: string;
  suggestedTitle: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  modelUsed?: string;
}
