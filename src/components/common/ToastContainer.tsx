import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-slide-in-right ${
              isSuccess
                ? 'bg-[#121E23]/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
                : isError
                ? 'bg-[#231217]/95 border-rose-500/40 text-rose-100 shadow-rose-950/40'
                : isWarning
                ? 'bg-[#231C12]/95 border-amber-500/40 text-amber-100 shadow-amber-950/40'
                : 'bg-[#181432]/95 border-purple-500/40 text-purple-100 shadow-purple-950/40'
            }`}
          >
            <div className="shrink-0 pt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isInfo && <Info className="w-5 h-5 text-[#A78BFA]" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold text-white tracking-wide">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
