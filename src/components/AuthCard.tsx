import React from 'react';
import { Sparkles, Shield, Database, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthCardProps {
  onSignIn: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onSignIn, isLoading, error }) => {
  return (
    <div id="auth-container" className="max-w-xl mx-auto my-12 px-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* Brand Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-400 text-white shadow-lg shadow-purple-900/30 mb-5">
            <Sparkles className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gemini Journal Studio
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-md mx-auto">
            Your private reflection sanctuary powered by Gemini 3.6 Flash and isolated Cloud Firestore.
          </p>

          {/* Security & Architecture Highlights */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Zero Password Storage</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Authenticates directly via Google OAuth 2.0 tokens. No plain passwords stored.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Isolated Firestore</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Enforces path-bound security rules (<code className="text-purple-300 text-[10px]">request.auth.uid == userId</code>).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Gemini 3.6 Flash</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Deep multi-turn reflection, socratic questioning, and brainstorming synthesizer.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Instant Insights</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Automated theme extraction, emotional tone mapping, and action checklists.
              </p>
            </div>
          </div>

          {error && (
            <div
              id="auth-error-banner"
              className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs text-left"
            >
              <div className="font-semibold flex items-center gap-1.5 text-rose-300">
                <Lock className="w-3.5 h-3.5" /> Authentication Alert
              </div>
              <div className="mt-1">{error}</div>
            </div>
          )}

          {/* Google Sign-In Action */}
          <button
            type="button"
            id="btn-google-signin"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isLoading ? 'Connecting to Google Auth...' : 'Continue with Google Sign-In'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 ml-auto text-zinc-500" />}
          </button>

          <p className="text-[11px] text-zinc-500 mt-4">
            By signing in, your personal journal reflections and summaries are saved securely in your private Firestore partition.
          </p>
        </div>
      </div>
    </div>
  );
};
