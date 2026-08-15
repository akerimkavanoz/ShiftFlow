import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, X, Check, Trash2 } from 'lucide-react';
import { departmentService } from '../services/departmentService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function DepartmentManagement() {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [error, setError] = useState('');
  const [deptFocused, setDeptFocused] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await departmentService.getAll();
      const deptList = result?.data || result;
      setDepartments(Array.isArray(deptList) ? deptList : []);
    } catch (err) {
      showToast(err.customMessage || "Departmanlar yüklenirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleDeptNameChange = (e) => {
    setDeptName(e.target.value);
    if (e.target.value.trim()) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setError("Departman adı boş geçilemez!");
      return;
    }

    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, { id: editingDept.id, name: deptName.trim() });
        showToast("Departman başarıyla güncellendi.", "success");
        setEditingDept(null);
      } else {
        await departmentService.create({ name: deptName.trim() });
        showToast("Departman başarıyla kaydedildi.", "success");
      }
      
      setDeptName('');
      setError('');
      fetchDepartments();
    } catch (err) {
      showToast(err.customMessage || "İşlem gerçekleştirilirken bir hata meydana geldi!", "error");
    }
  };

  const openDeleteModal = (id) => {
    setSelectedDeptId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDeptId(null);
  };

  const confirmDelete = async () => {
    if (!selectedDeptId) return;
    setDeleteLoading(true);
    try {
      await departmentService.delete(selectedDeptId);
      showToast("Departman başarıyla silindi.", "success");
      fetchDepartments();
      closeDeleteModal();
    } catch (err) {
      showToast(err.customMessage || "Silme işlemi sırasında bir hata oluştu.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEdit = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setError('');
  };

  const cancelEdit = () => {
    setEditingDept(null);
    setDeptName('');
    setError('');
  };

  return (
    <div className="space-y-6 w-full">
      <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 bg-white ${
        editingDept ? 'border-orange-300 shadow-orange-50/50' : 'border-gray-200'
      }`}>
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-5">
          {editingDept ? 'Departmanı Güncelle' : 'Departman Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="w-full">
            <div className="flex flex-col space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  id="dept_name"
                  value={deptName}
                  onChange={handleDeptNameChange}
                  onFocus={() => setDeptFocused(true)}
                  onBlur={() => setDeptFocused(false)}
                  placeholder={!deptFocused && !deptName ? "Departman adı giriniz" : ""}
                  className={`w-full px-4 py-3.5 rounded-xl border bg-white text-sm md:text-base outline-none transition-all focus:ring-4 ${
                    error
                      ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500'
                      : 'border-gray-300 focus:ring-orange-500/10 focus:border-orange-500'
                  }`}
                />
                <label
                  htmlFor="dept_name"
                  className={`absolute left-4 bg-white px-1 pointer-events-none transition-all duration-200 origin-left ${
                    deptName || deptFocused
                      ? '-top-2.5 text-xs md:text-sm font-semibold text-gray-500'
                      : 'top-3.5 text-base text-gray-400 opacity-0'
                  } ${deptFocused && (error ? 'text-rose-500' : 'text-orange-500')}`}
                >
                  Departman Adı
                </label>
              </div>
              {error && <span className="text-xs md:text-sm font-semibold text-rose-500 pl-1">{error}</span>}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            {editingDept && (
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
                editingDept ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {editingDept ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : null}
              {editingDept ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base md:text-lg font-bold text-gray-900">Departmanlar</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 text-center text-sm md:text-base text-gray-400 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Veritabanından departmanlar çekiliyor...</span>
            </div>
          ) : departments.length === 0 ? (
            <div className="p-14 text-center text-sm md:text-base text-gray-400">Henüz hiçbir departman kaydı bulunamadı.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 tracking-wider">
                  <th className="px-6 py-4 w-32">No</th>
                  <th className="px-6 py-4">Departman Adı</th>
                  <th className="px-6 py-4 text-right w-52">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm md:text-base">
                {departments.map((dept, index) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs md:text-sm text-gray-500 font-bold">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => startEdit(dept)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-orange-500 hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Düzenle
                        </button>
                        <button
                          onClick={() => openDeleteModal(dept.id)}
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
        title="Departmanı Sil"
        description="Bu departmanı silmek istediğinize emin misiniz?"
      />
    </div>
  );
}