import React from 'react';
import {
  Sparkles,
  BookOpen,
  History,
  PlusCircle,
  LogOut,
  BrainCircuit,
  Save,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  activeView: 'chat' | 'history' | 'summary';
  setActiveView: (view: 'chat' | 'history' | 'summary') => void;
  onNewSession: () => void;
  onSignOut: () => void;
  hasUnsavedChanges: boolean;
  onSaveCurrentEntry: () => void;
  isSaving: boolean;
  historyCount: number;
  entryTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  setActiveView,
  onNewSession,
  onSignOut,
  hasUnsavedChanges,
  onSaveCurrentEntry,
  isSaving,
  historyCount,
  entryTitle,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 text-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Current Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-400 text-white shadow-md shadow-purple-900/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100 tracking-tight text-base whitespace-nowrap">
                Gemini Journal
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60">
                <ShieldCheck className="w-3 h-3 text-purple-400" /> Firestore Private
              </span>
            </div>
            {user && (
              <p className="text-xs text-zinc-400 truncate max-w-[180px] sm:max-w-xs font-mono">
                {entryTitle || 'Untitled Reflection'}
              </p>
            )}
          </div>
        </div>

        {/* Center: Navigation View Tabs (if logged in) */}
        {user && (
          <nav id="main-navigation" className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              id="nav-tab-chat"
              onClick={() => setActiveView('chat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'chat'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              Journal Studio
            </button>

            <button
              type="button"
              id="nav-tab-summary"
              onClick={() => setActiveView('summary')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'summary'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
              AI Insights
            </button>

            <button
              type="button"
              id="nav-tab-history"
              onClick={() => setActiveView('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'history'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              Past Entries
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 text-[10px]">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <>
              {/* Quick Save button */}
              <button
                type="button"
                id="btn-save-entry-header"
                onClick={onSaveCurrentEntry}
                disabled={isSaving}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  hasUnsavedChanges
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                }`}
                title={hasUnsavedChanges ? 'Save changes to Firestore' : 'All changes saved to Firestore'}
              >
                {isSaving ? (
                  <Save className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : hasUnsavedChanges ? (
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save to Firestore' : 'Saved'}</span>
              </button>

              {/* New Session button */}
              <button
                type="button"
                id="btn-new-session"
                onClick={onNewSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-900/30 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Entry</span>
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-semibold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}

                <button
                  type="button"
                  id="btn-signout"
                  onClick={onSignOut}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors"
                  title="Sign out of Firebase"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Guest Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      {user && (
        <div className="md:hidden flex items-center justify-around border-t border-zinc-800/80 bg-zinc-950 px-2 py-2">
          <button
            type="button"
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeView === 'chat' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            Journal
          </button>
          <button
            type="button"
            onClick={() => setActiveView('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeView === 'summary' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
            Insights
          </button>
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeView === 'history' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
            }`}
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            Past ({historyCount})
          </button>
        </div>
      )}
    </header>
  );
};
