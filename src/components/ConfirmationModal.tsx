import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  details?: string[];
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Proceed',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  details,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        id="confirmation-modal-dialog"
        className="w-full max-w-md rounded-3xl bg-[#161616] border border-zinc-800 shadow-2xl p-6 text-zinc-100 relative"
      >
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded-full"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div
            className={`p-3 rounded-2xl ${
              isDestructive
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                : 'bg-amber-950/80 text-[#D4AF37] border border-amber-800'
            }`}
          >
            {isDestructive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-100">
              {title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-light">{message}</p>
          </div>
        </div>

        {details && details.length > 0 && (
          <div className="my-4 p-3.5 bg-[#0a0a0a] rounded-2xl border border-zinc-800 text-xs font-mono text-zinc-300 space-y-1.5 max-h-32 overflow-y-auto">
            {details.map((item, idx) => (
              <div key={idx} className="truncate">
                • {item}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-2xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all ${
              isDestructive
                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                : 'bg-[#D4AF37] hover:bg-[#c29f2e] text-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
