import api from './api';

export const employeeService = {
  // Aktif Personelleri Listele (GET)
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Departmana Göre Aktif Personelleri Listele (GET)
  getByDepartment: async (departmentId) => {
    const response = await api.get(`/employees/department/${departmentId}`);
    return response.data;
  },

  // Yeni Personel Ekle (POST)
  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Personel Bilgilerini Güncelle (PUT)
  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Personel Sil (DELETE)
  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};