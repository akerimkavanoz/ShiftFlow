import api from './api';

export const shiftAssignmentService = {
  // Aktif Tüm Vardiya Atamalarını Listele (GET)
  getAll: async () => {
    const response = await api.get('/shiftassignments');
    return response.data;
  },

  // Yeni Vardiya Ataması Oluştur (POST)
  create: async (assignmentData) => {
    const response = await api.post('/shiftassignments', assignmentData);
    return response.data;
  },

  // Vardiya Atamasını Güncelle (PUT)
  update: async (id, assignmentData) => {
    const response = await api.put(`/shiftassignments/${id}`, assignmentData);
    return response.data;
  },

  // Vardiya Atamasını Sil (DELETE)
  delete: async (id) => {
    const response = await api.delete(`/shiftassignments/${id}`);
    return response.data;
  },

  // Aylık Vardiya Raporunu PDF Olarak İndir (GET)
  exportMonthlyReport: async (departmentId, year, month) => {
    const response = await api.get('/shiftassignments/export-pdf', {
      params: { departmentId, year, month },
      responseType: 'blob' 
    });
    return response;
  },

  // Toplu Vardiya Ataması Oluştur (POST /bulk)
  createBulk: async (bulkDto) => {
    const response = await api.post('/shiftassignments/bulk', bulkDto);
    return response.data;
  }
};