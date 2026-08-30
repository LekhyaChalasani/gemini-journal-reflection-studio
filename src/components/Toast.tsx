import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, RefreshCw } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className={`pointer-events-auto p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-800'
              : toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
              : 'bg-zinc-900/90 text-zinc-100 border-zinc-700'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
          </div>

          <div className="flex-1 text-sm">
            <div className="font-semibold text-white">{toast.title}</div>
            <div className="text-zinc-300 mt-0.5">{toast.message}</div>
            {toast.action && (
              <button
                type="button"
                id={`toast-action-${toast.id}`}
                onClick={toast.action.onClick}
                className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {toast.action.label}
              </button>
            )}
          </div>

          <button
            type="button"
            id={`toast-dismiss-${toast.id}`}
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 p-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
