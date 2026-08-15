import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// MERKEZİ RESPONSE INTERCEPTOR (HATA YAKALAYICI)
api.interceptors.response.use(
  (response) => {
    // 200-299 arası başarılı yanıtları doğrudan geçiriyoruz
    return response;
  },
  (error) => {
    let errorMessage = 'Sistemde beklenmedik bir hata meydana geldi.';

    if (error.response) {
      const data = error.response.data;

      // 1. Backend ServiceResult yapımızdan gelen errorMessage kontrolü
      if (data && data.errorMessage) {
        if (Array.isArray(data.errorMessage) && data.errorMessage.length > 0) {
          errorMessage = data.errorMessage[0];
        } else if (typeof data.errorMessage === 'string') {
          errorMessage = data.errorMessage;
        }
      } 
      // 2. ASP.NET / FluentValidation varsayılan hata yapısı (Fallback)
      else if (data && data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        if (firstErrorKey && data.errors[firstErrorKey].length > 0) {
          errorMessage = data.errors[firstErrorKey][0];
        }
      }
    } else if (error.request) {
      // Backend kapalıysa veya ağ bağlantısı yoksa
      errorMessage = 'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı veya servisi kontrol edin.';
    }

    // Yakalanan temiz Türkçe mesajı error objesine ekliyoruz
    error.customMessage = errorMessage;

    return Promise.reject(error);
  }
);

export default api;