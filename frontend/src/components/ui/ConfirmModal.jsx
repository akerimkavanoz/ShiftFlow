import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = "Silme Onayı",
  description = "Bu kaydı silmek istediğinize emin misiniz?",
  confirmText = "Evet, Sil",
  cancelText = "İptal"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="bg-rose-50 p-3 rounded-xl text-rose-600 shrink-0">
            <AlertTriangle className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-gray-900">{title}</h4>
            <p className="text-sm md:text-base text-gray-500 mt-1.5">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4 text-xs md:text-sm">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
            )}
            {loading ? 'Siliniyor...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}