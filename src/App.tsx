import React, { useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase/config';
import {
  saveJournalEntry,
  loadUserJournalEntries,
  deleteJournalEntry,
} from './firebase/journalService';
import { UserProfile, ChatMessage, JournalEntry, JournalSummary } from './types';
import { Navbar } from './components/Navbar';
import { AuthCard } from './components/AuthCard';
import { JournalChat } from './components/JournalChat';
import { SummaryInsights } from './components/SummaryInsights';
import { HistoryView } from './components/HistoryView';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active View ('chat' | 'history' | 'summary')
  const [activeView, setActiveView] = useState<'chat' | 'history' | 'summary'>('chat');

  // Active Journal Entry State
  const [currentEntryId, setCurrentEntryId] = useState<string>(() => `entry_${Date.now()}`);
  const [entryTitle, setEntryTitle] = useState<string>('Daily Reflection');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSummary, setCurrentSummary] = useState<JournalSummary | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // History & List State
  const [historyEntries, setHistoryEntries] = useState<JournalEntry[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  // Async Operation Indicators
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string, action?: { label: string; onClick: () => void }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Reflective User',
          photoURL: user.photoURL,
        });
        setAuthError(null);
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch past entries whenever currentUser changes
  const fetchHistory = useCallback(async (userId: string) => {
    setIsHistoryLoading(true);
    try {
      const items = await loadUserJournalEntries(userId);
      setHistoryEntries(items);
    } catch (err: any) {
      console.error('Failed to load journal history:', err);
      addToast(
        'error',
        'Firestore Load Failed',
        'Could not fetch past entries from Firestore. Please check your network connection.'
      );
    } finally {
      setIsHistoryLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchHistory(currentUser.uid);
    } else {
      setHistoryEntries([]);
    }
  }, [currentUser, fetchHistory]);

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      addToast('success', 'Signed In', 'Welcome to your private reflection workspace.');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      let msg = err.message || 'Failed to authenticate with Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign in popup closed before finishing.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network connection failed. Please try again.';
      }
      setAuthError(msg);
      addToast('error', 'Sign In Issue', msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      handleNewSession();
      addToast('info', 'Signed Out', 'You have been securely signed out.');
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      addToast('error', 'Sign Out Failed', 'Could not sign out.');
    }
  };

  // Start New Session
  const handleNewSession = () => {
    setCurrentEntryId(`entry_${Date.now()}`);
    setEntryTitle('Daily Reflection');
    setMessages([]);
    setCurrentSummary(undefined);
    setHasUnsavedChanges(false);
    setChatError(null);
    setLastUserMessage(null);
    setActiveView('chat');
  };

  // Build the complete JournalEntry payload
  const buildCurrentEntry = useCallback((): JournalEntry => {
    return {
      id: currentEntryId,
      userId: currentUser?.uid || '',
      title: entryTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages,
      summary: currentSummary,
      tags: currentSummary?.keyThemes || [],
      mood: currentSummary?.emotionalTone,
      status: 'saved',
    };
  }, [currentEntryId, currentUser, entryTitle, messages, currentSummary]);

  // Save to Firestore with retry escalation
  const handleSaveCurrentEntry = async () => {
    if (!currentUser?.uid) {
      addToast('error', 'Auth Required', 'Please sign in with Google to save entries to Firestore.');
      return;
    }
    if (messages.length === 0) {
      addToast('info', 'No Content', 'Write some thoughts before saving.');
      return;
    }

    setIsSaving(true);
    const entryData = buildCurrentEntry();

    try {
      await saveJournalEntry(currentUser.uid, entryData);
      setHasUnsavedChanges(false);
      addToast('success', 'Saved to Firestore', `"${entryTitle}" has been securely persisted.`);
      // Refresh history list
      fetchHistory(currentUser.uid);
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      addToast(
        'error',
        'Firestore Persistence Failed',
        'Could not save your entry. Click Retry to re-attempt saving.',
        {
          label: 'Retry Save',
          onClick: () => handleSaveCurrentEntry(),
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Multi-turn Gemini Chat Handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setChatError(null);
    setLastUserMessage(text);

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setHasUnsavedChanges(true);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text.trim(),
          messages: updatedMessages,
          title: entryTitle,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to receive AI reflection.');
      }

      const modelText = json.data?.text || 'Thank you for sharing your thoughts.';
      const modelMsg: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        text: modelText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, modelMsg];
      setMessages(finalMessages);

      // Auto-save to Firestore if user is authenticated
      if (currentUser?.uid) {
        const entryData: JournalEntry = {
          id: currentEntryId,
          userId: currentUser.uid,
          title: entryTitle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: finalMessages,
          summary: currentSummary,
          tags: currentSummary?.keyThemes || [],
          status: 'active',
        };
        saveJournalEntry(currentUser.uid, entryData).catch((err) => {
          console.warn('Background auto-save failed:', err);
        });
      }
    } catch (err: any) {
      console.error('Error generating Gemini reply:', err);
      const errMsg = err.message || 'Error communicating with Gemini 3.6 Flash.';
      setChatError(errMsg);
      addToast('error', 'Gemini Reflection Failed', errMsg, {
        label: 'Retry Prompt',
        onClick: () => handleSendMessage(text),
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate Structured AI Summary & Brainstorming
  const handleGenerateSummary = async () => {
    if (messages.length === 0) {
      addToast('info', 'No Content to Summarize', 'Add reflection notes before generating a summary.');
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          title: entryTitle,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to synthesize summary.');
      }

      const summaryData: JournalSummary = json.data;
      setCurrentSummary(summaryData);
      setHasUnsavedChanges(true);
      setActiveView('summary');
      addToast('success', 'Insights Generated', 'Gemini synthesized your reflection and brainstorming ideas.');

      // Auto-save to Firestore
      if (currentUser?.uid) {
        const entryData: JournalEntry = {
          id: currentEntryId,
          userId: currentUser.uid,
          title: entryTitle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages,
          summary: summaryData,
          tags: summaryData.keyThemes || [],
          mood: summaryData.emotionalTone,
          status: 'saved',
        };
        await saveJournalEntry(currentUser.uid, entryData);
        setHasUnsavedChanges(false);
        fetchHistory(currentUser.uid);
      }
    } catch (err: any) {
      console.error('Error generating summary:', err);
      addToast('error', 'Summarization Failed', err.message || 'Could not generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Load an existing entry from History
  const handleLoadEntry = (entry: JournalEntry) => {
    setCurrentEntryId(entry.id);
    setEntryTitle(entry.title);
    setMessages(entry.messages || []);
    setCurrentSummary(entry.summary);
    setHasUnsavedChanges(false);
    setChatError(null);
    setActiveView('chat');
    addToast('info', 'Loaded Reflection', `Loaded "${entry.title}" into active workspace.`);
  };

  // Delete an entry from Firestore
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser?.uid) return;

    try {
      await deleteJournalEntry(currentUser.uid, entryId);
      addToast('success', 'Deleted', 'Reflection removed from Firestore.');
      // Refresh list
      fetchHistory(currentUser.uid);

      // If current active entry was deleted, reset canvas
      if (entryId === currentEntryId) {
        handleNewSession();
      }
    } catch (err: any) {
      console.error('Failed to delete entry:', err);
      addToast('error', 'Delete Failed', err.message || 'Could not delete entry.');
    }
  };

  // Inject deep question into chat
  const handleInjectQuestion = (question: string) => {
    setActiveView('chat');
    handleSendMessage(`Let's reflect on this question: "${question}"`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onNewSession={handleNewSession}
        onSignOut={handleSignOut}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveCurrentEntry={handleSaveCurrentEntry}
        isSaving={isSaving}
        historyCount={historyEntries.length}
        entryTitle={entryTitle}
      />

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {isAuthLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-400">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Verifying Firebase Authentication...</p>
          </div>
        ) : !currentUser ? (
          /* Authentication Screen */
          <div className="flex-1 flex items-center justify-center p-4">
            <AuthCard
              onSignIn={handleGoogleSignIn}
              isLoading={isAuthLoading}
              error={authError}
            />
          </div>
        ) : (
          /* Authenticated Dashboard */
          <>
            {activeView === 'chat' && (
              <JournalChat
                user={currentUser}
                title={entryTitle}
                onUpdateTitle={(newTitle) => {
                  setEntryTitle(newTitle);
                  setHasUnsavedChanges(true);
                }}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isAiLoading}
                onGenerateSummary={handleGenerateSummary}
                isSummarizing={isSummarizing}
                onSaveEntry={handleSaveCurrentEntry}
                isSaving={isSaving}
                onClearSession={handleNewSession}
                hasUnsavedChanges={hasUnsavedChanges}
                errorMessage={chatError}
                onRetryLastMessage={
                  lastUserMessage ? () => handleSendMessage(lastUserMessage) : undefined
                }
              />
            )}

            {activeView === 'summary' && (
              <SummaryInsights
                summary={currentSummary}
                entry={buildCurrentEntry()}
                onGenerateSummary={handleGenerateSummary}
                isSummarizing={isSummarizing}
                onSaveEntry={handleSaveCurrentEntry}
                isSaving={isSaving}
                onInjectQuestionIntoChat={handleInjectQuestion}
                onSwitchToChat={() => setActiveView('chat')}
              />
            )}

            {activeView === 'history' && (
              <HistoryView
                entries={historyEntries}
                isLoading={isHistoryLoading}
                onLoadEntry={handleLoadEntry}
                onDeleteEntry={handleDeleteEntry}
                onStartNewEntry={handleNewSession}
              />
            )}
          </>
        )}
      </main>

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
