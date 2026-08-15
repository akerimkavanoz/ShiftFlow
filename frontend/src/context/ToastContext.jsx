import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Her yerden çağrılabilecek merkezi bildirim fonksiyonu
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    
    // 3 saniye sonra otomatik kapatma
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* MERKEZİ ANIMASYONLU POPUP */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto max-w-md w-full animate-fade-in-down">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-md bg-white/95 transition-all ${
            toast.type === 'success' 
              ? 'border-emerald-200 text-emerald-900 shadow-emerald-100/40' 
              : 'border-rose-200 text-rose-900 shadow-rose-100/40'
          }`}>
            
            {/* Duruma göre dinamik İkonlar (Yeşil Tik veya Kırmızı Çarpı) */}
            {toast.type === 'success' ? (
              <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-rose-50 text-rose-600 shrink-0">
                <XCircle className="h-5 w-5" />
              </div>
            )}

            {/* Mesaj İçeriği */}
            <span className="flex-1 leading-relaxed">{toast.message}</span>

            {/* Kapatma Butonu */}
            <button 
              onClick={() => setToast(prev => ({ ...prev, show: false }))} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// Kolay kullanım için Custom Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast mutlaka ToastProvider içinde kullanılmalıdır!');
  }
  return context;
}