import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, X, XCircle } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'error' | 'info' | 'question';

export interface SweetAlertProps {
  isOpen: boolean;
  type?: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmButtonColor?: string;
}

export const SweetAlertModal: React.FC<SweetAlertProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  showCancel = false,
  onConfirm,
  onCancel,
  confirmButtonColor,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-600 ring-8 ring-amber-50">
            <AlertTriangle className="w-9 h-9" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600 ring-8 ring-rose-50">
            <XCircle className="w-9 h-9" />
          </div>
        );
      case 'question':
        return (
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4 text-[#0C7C82] ring-8 ring-teal-50">
            <HelpCircle className="w-9 h-9" />
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4 text-[#0288D1] ring-8 ring-sky-50">
            <Info className="w-9 h-9" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform transition-all animate-sweet-pop border border-slate-100">
        <button
          onClick={onCancel || onConfirm}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {renderIcon()}

        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6 whitespace-pre-line leading-relaxed">{message}</p>

        <div className="flex items-center justify-center gap-3">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition active:scale-95 text-sm"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            style={{ backgroundColor: confirmButtonColor || (type === 'error' || type === 'warning' ? '#D32F2F' : '#0C7C82') }}
            className="px-6 py-2.5 rounded-xl text-white font-medium shadow-md hover:brightness-110 transition active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
