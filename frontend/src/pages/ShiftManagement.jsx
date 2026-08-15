import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Edit2, X, Check, Trash2, Clock, Palette } from 'lucide-react';
import { CompactPicker } from 'react-color';
import { shiftService } from '../services/shiftService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import TimePickerInput from '../components/ui/TimePickerInput';
import { useClickOutside } from '../hooks/useClickOutside';

export default function ShiftManagement() {
  const { showToast } = useToast();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [colorCode, setColorCode] = useState('#10B981');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const [errors, setErrors] = useState({ name: '', startTime: '', endTime: '' });
  const [nameFocused, setNameFocused] = useState(false);

  const colorPickerRef = useRef(null);
  useClickOutside(colorPickerRef, () => setShowColorPicker(false));

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await shiftService.getAll();
      const shiftList = result?.data || result;
      setShifts(Array.isArray(shiftList) ? shiftList : []);
    } catch (err) {
      showToast(err.customMessage || "Vardiya verileri veritabanından çekilemedi!", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (e.target.value.trim()) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let localErrors = { name: '', startTime: '', endTime: '' };
    let hasError = false;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!name.trim()) {
      localErrors.name = "Vardiya adı boş geçilemez!";
      hasError = true;
    }

    if (startTime && !endTime) {
      localErrors.endTime = "Başlangıç saati girildiğinde bitiş saati de zorunludur!";
      hasError = true;
    } else if (startTime && !timeRegex.test(startTime)) {
      localErrors.startTime = "Geçersiz saat formatı! (Örn: 08:30)";
      hasError = true;
    }

    if (endTime && !startTime) {
      localErrors.startTime = "Bitiş saati girildiğinde başlangıç saati de zorunludur!";
      hasError = true;
    } else if (endTime && !timeRegex.test(endTime)) {
      localErrors.endTime = "Geçersiz saat formatı! (Örn: 17:00)";
      hasError = true;
    }

    if (startTime && endTime && startTime === endTime) {
      localErrors.endTime = "Vardiya başlangıç ve bitiş saati aynı olamaz!";
      hasError = true;
    }

    if (hasError) {
      setErrors(localErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      startTime: startTime ? startTime : null,
      endTime: endTime ? endTime : null,
      colorCode: colorCode || null
    };

    try {
      if (editingShift) {
        await shiftService.update(editingShift.id, { id: editingShift.id, ...payload });
        showToast("Vardiya başarıyla güncellendi.", "success");
        setEditingShift(null);
      } else {
        await shiftService.create(payload);
        showToast("Vardiya başarıyla kaydedildi.", "success");
      }
      
      setName('');
      setStartTime('');
      setEndTime('');
      setColorCode('#10B981');
      setErrors({ name: '', startTime: '', endTime: '' });
      fetchShifts();
    } catch (err) {
      showToast(err.customMessage || "İşlem gerçekleştirilirken bir hata meydana geldi!", "error");
    }
  };

  const openDeleteModal = (id) => {
    setSelectedShiftId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedShiftId(null);
  };

  const confirmDelete = async () => {
    if (!selectedShiftId) return;
    setDeleteLoading(true);
    try {
      await shiftService.delete(selectedShiftId);
      showToast("Vardiya başarıyla silindi.", "success");
      fetchShifts();
      closeDeleteModal();
    } catch (err) {
      showToast(err.customMessage || "Silme işlemi sırasında bir hata oluştu.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEdit = (shift) => {
    setEditingShift(shift);
    setName(shift.name);
    setStartTime(shift.startTime ? shift.startTime.substring(0, 5) : '');
    setEndTime(shift.endTime ? shift.endTime.substring(0, 5) : '');
    setColorCode(shift.colorCode || shift.ColorCode || '#10B981');
    setErrors({ name: '', startTime: '', endTime: '' });
  };

  const cancelEdit = () => {
    setEditingShift(null);
    setName('');
    setStartTime('');
    setEndTime('');
    setColorCode('#10B981');
    setErrors({ name: '', startTime: '', endTime: '' });
  };

  return (
    <div className="space-y-6 w-full select-none">
      <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 bg-white overflow-visible ${
        editingShift ? 'border-orange-300 shadow-orange-50/50' : 'border-gray-200'
      }`}>
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-5">
          {editingShift ? 'Vardiya Bilgilerini Güncelle' : 'Vardiya Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-visible">
            <div className="flex flex-col space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  id="shift_name"
                  value={name}
                  onChange={handleNameChange}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder={!nameFocused && !name ? "Vardiya adı giriniz" : ""}
                  className={`w-full px-4 py-3.5 rounded-xl border bg-white text-sm md:text-base outline-none transition-all focus:ring-4 focus:outline-none focus:border-orange-500/80 ${
                    errors.name
                      ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500'
                      : 'border-gray-300 focus:ring-orange-500/10 focus:border-orange-500'
                  }`}
                />
                <label
                  htmlFor="shift_name"
                  className={`absolute left-4 bg-white px-1.5 pointer-events-none transition-all duration-200 origin-left ${
                    name || nameFocused ? '-top-2.5 text-xs md:text-sm font-medium text-gray-500' : 'top-3.5 text-base text-gray-400 opacity-0'
                  } ${nameFocused && (errors.name ? 'text-rose-500' : 'text-orange-500')}`}
                >
                  Vardiya Adı
                </label>
              </div>
              {errors.name && <span className="text-xs md:text-sm font-semibold text-rose-500 pl-1">{errors.name}</span>}
            </div>

            <TimePickerInput
              id="start_time"
              label="Başlangıç Saati"
              value={startTime}
              onChange={(val) => {
                setStartTime(val);
                setErrors(prev => ({ ...prev, startTime: '', endTime: '' }));
              }}
              error={errors.startTime}
              disabled={loading}
            />

            <TimePickerInput
              id="end_time"
              label="Bitiş Saati"
              value={endTime}
              onChange={(val) => {
                setEndTime(val);
                setErrors(prev => ({ ...prev, startTime: '', endTime: '' }));
              }}
              error={errors.endTime}
              disabled={loading}
            />

            <div className="flex flex-col space-y-1.5 relative" ref={colorPickerRef}>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-white flex items-center justify-between hover:border-gray-400 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-lg border border-black/10 shadow-xs"
                      style={{ backgroundColor: colorCode }}
                    />
                    <span className="text-sm md:text-base font-bold text-gray-700 uppercase">
                      {colorCode}
                    </span>
                  </div>
                  <Palette className="h-5 w-5 text-gray-400" />
                </button>

                <label className="absolute left-4 -top-2.5 bg-white px-1.5 text-xs md:text-sm font-medium text-gray-500 pointer-events-none">
                  Vardiya Rengi
                </label>
              </div>

              {showColorPicker && (
                <div className="absolute top-16 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 bg-white animate-in fade-in zoom-in-95 duration-150">
                  <CompactPicker
                    color={colorCode}
                    onChangeComplete={(color) => {
                      setColorCode(color.hex);
                      setShowColorPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            {editingShift && (
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
                editingShift ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {editingShift && <Check className="h-4 w-4 md:h-5 md:w-5" />}
              {editingShift ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base md:text-lg font-bold text-gray-900">Vardiya Listesi</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 text-center text-xs md:text-sm text-gray-400 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Vardiya listesi yükleniyor...</span>
            </div>
          ) : shifts.length === 0 ? (
            <div className="p-14 text-center text-xs md:text-sm text-gray-400">
              Henüz hiçbir vardiya kaydı bulunamadı.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 tracking-wider">
                  <th className="px-6 py-4 w-24">No</th>
                  <th className="px-6 py-4 w-36">Renk</th>
                  <th className="px-6 py-4">Vardiya Adı</th>
                  <th className="px-6 py-4">Çalışma Saatleri</th>
                  <th className="px-6 py-4 text-right w-52">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm md:text-base">
                {shifts.map((shift, index) => {
                  const shiftColor = shift.colorCode || shift.ColorCode;
                  const startStr = shift.startTime ? shift.startTime.substring(0, 5) : '--:--';
                  const endStr = shift.endTime ? shift.endTime.substring(0, 5) : '--:--';

                  return (
                    <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs md:text-sm text-gray-500 font-bold">{index + 1}</td>
                      <td className="px-6 py-4">
                        {shiftColor ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-md border border-black/10 shadow-2xs shrink-0"
                              style={{ backgroundColor: shiftColor }}
                            />
                            <span className="text-xs font-mono font-bold text-gray-600 uppercase">
                              {shiftColor}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-400 pl-2">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{shift.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Clock className="h-4 w-4 text-slate-500 stroke-[2.5]" />
                          {startStr} - {endStr}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => startEdit(shift)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-orange-500 hover:text-white transition-all shadow-sm cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Düzenle
                          </button>
                          <button
                            onClick={() => openDeleteModal(shift.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all shadow-sm cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        title="Vardiyayı Sil"
        description="Bu vardiyayı silmek istediğinize emin misiniz?"
      />
    </div>
  );
}