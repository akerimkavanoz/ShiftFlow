import api from './api';

export const departmentService = {
  // Departmanları Listele (GET)
  getAll: async () => {
    const response = await api.get('/departments');
    return response.data; 
  },

  // Yeni Departman Ekle (POST)
  create: async (departmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },

  // Departman Güncelle (PUT)
  update: async (id, departmentData) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  // Departmanı Sil (DELETE)
  delete: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  }
};