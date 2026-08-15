import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, X, Check, Trash2 } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import CustomDropdown from '../components/ui/CustomDropdown';

export default function EmployeeManagement() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [errors, setErrors] = useState({ name: '', surname: '', departmentId: '' });
  const [nameFocused, setNameFocused] = useState(false);
  const [surnameFocused, setSurnameFocused] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empResult, deptResult] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll()
      ]);

      const empList = empResult?.data || empResult;
      const deptList = deptResult?.data || deptResult;

      setEmployees(Array.isArray(empList) ? empList : []);
      setDepartments(Array.isArray(deptList) ? deptList : []);
    } catch (err) {
      showToast(err.customMessage || "Personel veya departman verileri çekilemedi!", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (e.target.value.trim()) setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleSurnameChange = (e) => {
    setSurname(e.target.value);
    if (e.target.value.trim()) setErrors(prev => ({ ...prev, surname: '' }));
  };

  const handleDeptSelect = (id) => {
    setDepartmentId(String(id));
    setErrors(prev => ({ ...prev, departmentId: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let localErrors = { name: '', surname: '', departmentId: '' };
    let hasError = false;

    if (!name.trim()) {
      localErrors.name = "Personel ismi boş geçilemez!";
      hasError = true;
    }
    if (!surname.trim()) {
      localErrors.surname = "Personel soyismi boş geçilemez!";
      hasError = true;
    }
    if (!departmentId) {
      localErrors.departmentId = "Lütfen bir departman seçiniz!";
      hasError = true;
    }

    if (hasError) {
      setErrors(localErrors);
      return; 
    }

    const payload = {
      name: name.trim(),
      surname: surname.trim(),
      departmentId: parseInt(departmentId)
    };

    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, { id: editingEmployee.id, ...payload });
        showToast("Personel başarıyla güncellendi.", "success");
        setEditingEmployee(null);
      } else {
        await employeeService.create(payload);
        showToast("Personel başarıyla kaydedildi.", "success");
      }
      
      setName('');
      setSurname('');
      setDepartmentId('');
      setErrors({ name: '', surname: '', departmentId: '' });
      fetchData();
    } catch (err) {
      showToast(err.customMessage || "İşlem gerçekleştirilirken bir hata meydana geldi!", "error");
    }
  };

  const openDeleteModal = (id) => {
    setSelectedEmpId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedEmpId(null);
  };

  const confirmDelete = async () => {
    if (!selectedEmpId) return;
    setDeleteLoading(true);
    try {
      await employeeService.delete(selectedEmpId);
      showToast("Personel başarıyla silindi.", "success");
      fetchData();
      closeDeleteModal();
    } catch (err) {
      showToast(err.customMessage || "Silme işlemi sırasında bir hata oluştu.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEdit = (emp) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setSurname(emp.surname);
    setDepartmentId(emp.departmentId ? emp.departmentId.toString() : '');
    setErrors({ name: '', surname: '', departmentId: '' });
  };

  const cancelEdit = () => {
    setEditingEmployee(null);
    setName('');
    setSurname('');
    setDepartmentId('');
    setErrors({ name: '', surname: '', departmentId: '' });
  };

  return (
    <div className="space-y-6 w-full select-none">
      <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 bg-white overflow-visible ${
        editingEmployee ? 'border-orange-300 shadow-orange-50/50' : 'border-gray-200'
      }`}>
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-5">
          {editingEmployee ? 'Personel Bilgilerini Güncelle' : 'Personel Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-visible">
            <div className="flex flex-col space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  id="emp_name"
                  value={name}
                  onChange={handleNameChange}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder={!nameFocused && !name ? "Ad giriniz" : ""}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm md:text-base outline-none transition-all focus:ring-4 ${
                    errors.name 
                      ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' 
                      : 'border-gray-300 focus:ring-orange-500/10 focus:border-orange-500'
                  }`}
                />
                <label
                  htmlFor="emp_name"
                  className={`absolute left-4 bg-white px-1.5 pointer-events-none transition-all duration-200 origin-left ${
                    name || nameFocused ? '-top-2.5 text-xs md:text-sm font-medium text-gray-500' : 'top-3.5 text-base text-gray-400 opacity-0'
                  } ${nameFocused && (errors.name ? 'text-rose-500' : 'text-orange-500')}`}
                >
                  Ad
                </label>
              </div>
              {errors.name && <span className="text-xs md:text-sm font-semibold text-rose-500 pl-1">{errors.name}</span>}
            </div>

            <div className="flex flex-col space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  id="emp_surname"
                  value={surname}
                  onChange={handleSurnameChange}
                  onFocus={() => setSurnameFocused(true)}
                  onBlur={() => setSurnameFocused(false)}
                  placeholder={!surnameFocused && !surname ? "Soyad giriniz" : ""}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm md:text-base outline-none transition-all focus:ring-4 ${
                    errors.surname 
                      ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' 
                      : 'border-gray-300 focus:ring-orange-500/10 focus:border-orange-500'
                  }`}
                />
                <label
                  htmlFor="emp_surname"
                  className={`absolute left-4 bg-white px-1.5 pointer-events-none transition-all duration-200 origin-left ${
                    surname || surnameFocused ? '-top-2.5 text-xs md:text-sm font-medium text-gray-500' : 'top-3.5 text-base text-gray-400 opacity-0'
                  } ${surnameFocused && (errors.surname ? 'text-rose-500' : 'text-orange-500')}`}
                >
                  Soyad
                </label>
              </div>
              {errors.surname && <span className="text-xs md:text-sm font-semibold text-rose-500 pl-1">{errors.surname}</span>}
            </div>

            <CustomDropdown
              label="Departman"
              value={departmentId}
              options={departments}
              onSelect={handleDeptSelect}
              placeholder="Departman seçiniz"
              error={errors.departmentId}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            {editingEmployee && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-2 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" /> İptal
              </button>
            )}
            <button
              type="submit"
              className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl text-xs md:text-sm font-bold shadow-sm transition-colors cursor-pointer ${
                editingEmployee ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {editingEmployee && <Check className="h-4 w-4 md:h-5 md:w-5" />}
              {editingEmployee ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base md:text-lg font-bold text-gray-900">Personel Listesi</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 text-center text-xs md:text-sm text-gray-400 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Personel listesi yükleniyor...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-14 text-center text-xs md:text-sm text-gray-400">
              Henüz hiçbir personel kaydı bulunamadı.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 tracking-wider">
                  <th className="px-6 py-4 w-32">No</th>
                  <th className="px-6 py-4">Ad Soyad</th>
                  <th className="px-6 py-4">Departman</th>
                  <th className="px-6 py-4 text-right w-52">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm md:text-base">
                {employees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs md:text-sm text-gray-500 font-bold">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{emp.name} {emp.surname}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                        {emp.departmentName || 'Belirtilmemiş'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => startEdit(emp)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-orange-500 hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Düzenle
                        </button>
                        <button
                          onClick={() => openDeleteModal(emp.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Personeli Sil"
        description="Bu personeli silmek istediğinize emin misiniz?"
      />
    </div>
  );
}