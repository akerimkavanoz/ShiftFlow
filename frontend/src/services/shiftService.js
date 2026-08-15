import api from './api';

export const shiftService = {
  // Aktif Vardiyaları Listele (GET)
  getAll: async () => {
    const response = await api.get('/shifts');
    return response.data;
  },

  // Yeni Vardiya Ekle (POST)
  create: async (shiftData) => {
    const response = await api.post('/shifts', shiftData);
    return response.data;
  },

  // Vardiya Bilgilerini Güncelle (PUT)
  update: async (id, shiftData) => {
    const response = await api.put(`/shifts/${id}`, shiftData);
    return response.data;
  },

  // Vardiya Sil (DELETE)
  delete: async (id) => {
    const response = await api.delete(`/shifts/${id}`);
    return response.data;
  }
};