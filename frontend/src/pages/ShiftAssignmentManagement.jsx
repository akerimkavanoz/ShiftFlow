import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Download,
  FileText,
  Layers,
  Users,
  CalendarDays,
  RefreshCw,
  Building2,
  CheckSquare,
  Square
} from 'lucide-react';
import { departmentService } from '../services/departmentService';
import { employeeService } from '../services/employeeService';
import { shiftService } from '../services/shiftService';
import { shiftAssignmentService } from '../services/shiftAssignmentService';
import { useToast } from '../context/ToastContext';
import CustomDropdown from '../components/ui/CustomDropdown';
import DatePickerInput from '../components/ui/DatePickerInput';
import { useClickOutside } from '../hooks/useClickOutside';
import { MONTHS } from '../constants/appConstants';

export default function ShiftAssignmentManagement() {
  const { showToast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [bulkDeptId, setBulkDeptId] = useState('');
  const [bulkEmployees, setBulkEmployees] = useState([]);
  const [bulkEmpLoading, setBulkEmpLoading] = useState(false);
  const [bulkEmployeeIds, setBulkEmployeeIds] = useState([]);
  const [bulkShiftId, setBulkShiftId] = useState('');
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [includeSaturday, setIncludeSaturday] = useState(false);
  const [includeSunday, setIncludeSunday] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [isBulkEmpOpen, setIsBulkEmpOpen] = useState(false);
  const bulkEmpButtonRef = useRef(null);
  const bulkEmpDropdownRef = useRef(null);
  useClickOutside(bulkEmpDropdownRef, () => setIsBulkEmpOpen(false), bulkEmpButtonRef);

  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportDeptId, setReportDeptId] = useState('');

  const [dropdownConfig, setDropdownConfig] = useState(null);
  const cellDropdownRef = useRef(null);
  useClickOutside(cellDropdownRef, () => setDropdownConfig(null));

  const yearsList = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 3 + i);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const getWeekDays = (start) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const clone = new Date(start);
      clone.setDate(start.getDate() + i);
      days.push(clone);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [deptResult, shiftResult] = await Promise.all([
          departmentService.getAll(),
          shiftService.getAll()
        ]);

        const deptList = deptResult?.data || deptResult;
        const shiftList = shiftResult?.data || shiftResult;

        setDepartments(Array.isArray(deptList) ? deptList : []);
        setShifts(Array.isArray(shiftList) ? shiftList : []);

        if (Array.isArray(deptList) && deptList.length > 0) {
          setSelectedDeptId(String(deptList[0].id));
          setReportDeptId(String(deptList[0].id));
        }
      } catch (err) {
        showToast(err.customMessage || "Sistem başlangıç verileri çekilemedi!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [showToast]);

  useEffect(() => {
    const fetchBulkEmployees = async () => {
      if (!bulkDeptId) {
        setBulkEmployees([]);
        setBulkEmployeeIds([]);
        return;
      }
      setBulkEmpLoading(true);
      try {
        const empResult = await employeeService.getByDepartment(bulkDeptId);
        const empList = empResult?.data || empResult;
        setBulkEmployees(Array.isArray(empList) ? empList : []);
        setBulkEmployeeIds([]);
      } catch (err) {
        showToast(err.customMessage || "Seçili departmanın personelleri getirilemedi!", "error");
      } finally {
        setBulkEmpLoading(false);
      }
    };
    fetchBulkEmployees();
  }, [bulkDeptId, showToast]);

  const fetchMatrixData = useCallback(async () => {
    if (!selectedDeptId) return;
    setLoading(true);
    try {
      const [empResult, assignResult] = await Promise.all([
        employeeService.getByDepartment(selectedDeptId),
        shiftAssignmentService.getAll()
      ]);

      const empList = empResult?.data || empResult;
      const assignList = assignResult?.data || assignResult;

      setEmployees(Array.isArray(empList) ? empList : []);
      setAssignments(Array.isArray(assignList) ? assignList : []);
    } catch (err) {
      showToast(err.customMessage || "Personel veya vardiya atamaları getirilemedi!", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId, showToast]);

  useEffect(() => {
    fetchMatrixData();
  }, [fetchMatrixData]);

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
    setDropdownConfig(null);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
    setDropdownConfig(null);
  };

  const getCellAssignment = (employeeId, date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const calendarDateStr = `${year}-${month}-${day}`;

    return assignments.find(a => {
      const apiDateStr = a.date ? a.date.split('T')[0] : '';
      return a.employeeId === employeeId && apiDateStr === calendarDateStr;
    });
  };

  const handleShiftChange = async (employeeId, selectedShiftId, currentAssignment, date) => {
    setDropdownConfig(null);
    setActionLoading(true);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}T00:00:00`;

    try {
      if (!selectedShiftId) {
        if (currentAssignment) {
          await shiftAssignmentService.delete(currentAssignment.id);
          showToast("Vardiya ataması başarıyla iptal edildi.", "success");
        }
      } else if (currentAssignment) {
        await shiftAssignmentService.update(currentAssignment.id, {
          id: currentAssignment.id,
          employeeId: employeeId,
          shiftId: parseInt(selectedShiftId),
          date: formattedDate
        });
        showToast("Vardiya bilgisi başarıyla güncellendi.", "success");
      } else {
        await shiftAssignmentService.create({
          employeeId: employeeId,
          shiftId: parseInt(selectedShiftId),
          date: formattedDate
        });
        showToast("Yeni vardiya ataması başarıyla kaydedildi.", "success");
      }

      const refreshResult = await shiftAssignmentService.getAll();
      const refreshList = refreshResult?.data || refreshResult;
      setAssignments(Array.isArray(refreshList) ? refreshList : []);
    } catch (err) {
      showToast(err.customMessage || "Vardiya işlemi kaydedilirken bir hata oluştu!", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAssignmentSubmit = async () => {
    if (!bulkDeptId) {
      showToast("Lütfen bir departman seçin!", "error");
      return;
    }
    if (bulkEmployeeIds.length === 0) {
      showToast("Lütfen en az bir personel seçin!", "error");
      return;
    }
    if (!bulkShiftId) {
      showToast("Lütfen atanacak vardiyayı seçin!", "error");
      return;
    }
    if (!bulkStartDate || !bulkEndDate) {
      showToast("Lütfen başlangıç ve bitiş tarihlerini girin!", "error");
      return;
    }

    if (new Date(bulkStartDate) > new Date(bulkEndDate)) {
      showToast("Başlangıç tarihi bitiş tarihinden sonra olamaz!", "error");
      return;
    }

    setBulkLoading(true);
    try {
      const bulkPayload = {
        employeeIds: bulkEmployeeIds.map(id => parseInt(id)),
        shiftId: parseInt(bulkShiftId),
        startDate: `${bulkStartDate}T00:00:00`,
        endDate: `${bulkEndDate}T00:00:00`,
        includeSaturday: includeSaturday,
        includeSunday: includeSunday,
        overwriteExisting: overwriteExisting
      };

      await shiftAssignmentService.createBulk(bulkPayload);
      showToast("Toplu vardiya ataması başarıyla tamamlandı.", "success");

      await fetchMatrixData();

      setBulkEmployeeIds([]);
      setBulkShiftId('');
      setBulkStartDate('');
      setBulkEndDate('');
    } catch (err) {
      showToast(err.customMessage || "Toplu vardiya ataması gerçekleştirilemedi!", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelectEmployee = (empId) => {
    const id = parseInt(empId);
    setBulkEmployeeIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllEmployees = () => {
    if (bulkEmployeeIds.length === bulkEmployees.length) {
      setBulkEmployeeIds([]);
    } else {
      setBulkEmployeeIds(bulkEmployees.map(e => e.id));
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportDeptId) {
      showToast("Lütfen önce bir departman seçin!", "error");
      return;
    }
    setPdfLoading(true);
    try {
      const response = await shiftAssignmentService.exportMonthlyReport(
        parseInt(reportDeptId),
        parseInt(reportYear),
        parseInt(reportMonth)
      );

      const blob = response.data;
      if (!blob || !(blob instanceof Blob)) {
        throw new Error("Gelen veri bir dosya (Blob) formatında değil.");
      }

      let filename = `${reportYear}_Vardiya_Cizelgesi.pdf`;
      const contentDisposition = response.headers?.['content-disposition'];

      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
        }
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 200);

      showToast("Vardiya çizelgesi başarıyla indirildi.", "success");
    } catch (err) {
      let errorMsg = err.customMessage || "Rapor oluşturulurken bir hata oluştu!";
      
      if (err.response?.data instanceof Blob) {
        try {
          const errorText = await err.response.data.text();
          const errorJson = JSON.parse(errorText);
          if (errorJson?.errorMessage) {
            errorMsg = Array.isArray(errorJson.errorMessage) ? errorJson.errorMessage[0] : errorJson.errorMessage;
          }
        } catch (e) {
          // ignore parsing error
        }
      }
      
      showToast(errorMsg, "error");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCellClick = (e, empId, day, currentAssignment) => {
    if (actionLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cellKey = `${empId}-${day.toDateString()}`;

    if (dropdownConfig && dropdownConfig.key === cellKey) {
      setDropdownConfig(null);
      return;
    }

    setDropdownConfig({
      key: cellKey,
      empId,
      day,
      currentAssignment,
      position: {
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width
      }
    });
  };

  let bulkEmpButtonText = "Personel Seçin";
  if (!bulkDeptId) {
    bulkEmpButtonText = "Önce Departman Seçin";
  } else if (bulkEmpLoading) {
    bulkEmpButtonText = "Personeller Yükleniyor...";
  } else if (bulkEmployeeIds.length === 0) {
    bulkEmpButtonText = "Personel Seçin";
  } else if (bulkEmployeeIds.length === bulkEmployees.length && bulkEmployees.length > 0) {
    bulkEmpButtonText = `Tüm Personeller (${bulkEmployees.length})`;
  } else {
    bulkEmpButtonText = `${bulkEmployeeIds.length} Personel Seçildi`;
  }

  return (
    <div className="space-y-6 relative w-full select-none">

      {actionLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl border border-slate-800">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            <span className="text-xs font-medium">Veri Tabanı Güncelleniyor...</span>
          </div>
        </div>
      )}

      {/* SABİT KONTROL TOOLBARI (ÜST MATRİS İÇİN) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px]">
            <CustomDropdown
              label="Departman"
              value={selectedDeptId}
              options={departments}
              onSelect={(id) => setSelectedDeptId(id)}
              placeholder="Departman Seçiniz..."
            />
          </div>

          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-sm h-[42px] mt-1">
            <button onClick={handlePrevWeek} className="p-1.5 hover:bg-white hover:text-orange-500 rounded-lg text-gray-600 transition-all cursor-pointer">
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-3 whitespace-nowrap uppercase tracking-wider">
              {weekDays[0].toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={handleNextWeek} className="p-1.5 hover:bg-white hover:text-orange-500 rounded-lg text-gray-600 transition-all cursor-pointer">
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* MATRİS TABLO ALANI */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full overflow-hidden">
        <div className="overflow-x-auto relative">
          {loading ? (
            <div className="p-20 text-center text-xs md:text-sm text-gray-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 text-orange-500 animate-spin" />
              <span className="font-medium">Vardiya matrisi yükleniyor...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-20 text-center text-sm md:text-base text-gray-400 font-medium">
              ℹ️ Seçili departmana kayıtlı aktif personel bulunamadı.
            </div>
          ) : (
            <>
              {/* MASAÜSTÜ TABLO GÖRÜNÜMÜ */}
              <div className="hidden lg:block w-full">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-gray-50/70 text-xs font-bold uppercase text-gray-400 border-b border-gray-100 tracking-wider">
                      <th className="px-6 py-4 w-72 border-r border-gray-100 sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)]">
                        Personel Adı Soyadı
                      </th>
                      {weekDays.map((day, idx) => {
                        const isToday = new Date().toDateString() === day.toDateString();
                        return (
                          <th key={idx} className={`px-2 py-4 text-center border-r border-gray-100 last:border-r-0 w-[14%] ${isToday ? 'bg-orange-50/40' : ''}`}>
                            <div className={`font-bold ${isToday ? 'text-orange-600' : 'text-gray-800'}`}>{day.toLocaleDateString('tr-TR', { weekday: 'short' })}</div>
                            <div className={`text-[11px] font-semibold mt-0.5 ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>{day.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800 border-r border-gray-100 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)] align-middle break-words whitespace-normal leading-tight">
                          {emp.name} {emp.surname}
                        </td>

                        {weekDays.map((day, idx) => {
                          const currentAssignment = getCellAssignment(emp.id, day);
                          const isToday = new Date().toDateString() === day.toDateString();

                          const activeShift = currentAssignment ? shifts.find(s => s.id === currentAssignment.shiftId) : null;
                          const startStr = activeShift?.startTime ? activeShift.startTime.substring(0, 5) : '';
                          const endStr = activeShift?.endTime ? activeShift.endTime.substring(0, 5) : '';
                          const activeShiftColor = activeShift?.colorCode || activeShift?.ColorCode;

                          const cellKey = `${emp.id}-${day.toDateString()}`;
                          const isCurrentActive = dropdownConfig?.key === cellKey;

                          return (
                            <td key={idx} className={`p-1.5 border-r border-gray-100 last:border-r-0 text-center align-middle ${isToday ? 'bg-orange-50/10' : ''}`}>
                              <div
                                onClick={(e) => handleCellClick(e, emp.id, day, currentAssignment)}
                                style={currentAssignment && activeShiftColor ? {
                                  backgroundColor: `${activeShiftColor}1A`,
                                  borderColor: `${activeShiftColor}60`,
                                  color: activeShiftColor
                                } : undefined}
                                className={`group min-h-[52px] flex flex-col justify-center items-center rounded-xl border px-2 py-1.5 transition-all duration-200 cursor-pointer relative ${currentAssignment
                                    ? 'font-extrabold shadow-2xs'
                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-100/50'
                                  } ${isCurrentActive ? 'ring-2 ring-orange-500/20 border-orange-400 bg-white z-30' : ''}`}
                              >
                                {currentAssignment && activeShift ? (
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-black tracking-wide uppercase leading-tight">{activeShift.name}</span>
                                    <span className="text-[10px] font-bold mt-0.5 tracking-tight opacity-90">{startStr} - {endStr}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs font-medium text-gray-400">Boş</span>
                                )}

                                {!currentAssignment && (
                                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-gray-400 transition-colors">
                                    <ChevronDown className="h-3 w-3 stroke-[2.5]" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBİL GÖRÜNÜMü */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {employees.map((emp) => (
                  <div key={emp.id} className="p-4 bg-white space-y-3">
                    <div className="flex items-center space-x-2.5 border-b border-slate-50 pb-2">
                      <span className="font-bold text-gray-900 break-words whitespace-normal">{emp.name} {emp.surname}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {weekDays.map((day, idx) => {
                        const currentAssignment = getCellAssignment(emp.id, day);
                        const activeShift = currentAssignment ? shifts.find(s => s.id === currentAssignment.shiftId) : null;
                        const startStr = activeShift?.startTime ? activeShift.startTime.substring(0, 5) : '';
                        const endStr = activeShift?.endTime ? activeShift.endTime.substring(0, 5) : '';
                        const activeShiftColor = activeShift?.colorCode || activeShift?.ColorCode;

                        const cellKey = `${emp.id}-${day.toDateString()}-mob`;
                        const isCurrentActive = dropdownConfig?.key === cellKey;

                        return (
                          <div key={idx} className="flex items-center justify-between border border-gray-100 rounded-xl p-2.5 bg-slate-50/50">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                              {day.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>

                            <div
                              onClick={(e) => handleCellClick(e, emp.id, day, currentAssignment)}
                              style={currentAssignment && activeShiftColor ? {
                                backgroundColor: `${activeShiftColor}1A`,
                                borderColor: `${activeShiftColor}60`,
                                color: activeShiftColor
                              } : undefined}
                              className={`relative flex items-center w-44 min-h-[44px] justify-center border rounded-xl bg-white p-1 cursor-pointer shadow-2xs transition-all ${currentAssignment ? 'font-bold' : 'border-gray-200 text-gray-400'
                                } ${isCurrentActive ? 'ring-2 ring-orange-500/20 border-orange-400 z-30' : ''}`}
                            >
                              {currentAssignment && activeShift ? (
                                <div className="flex flex-col items-center justify-center text-center">
                                  <span className="text-xs font-black uppercase leading-tight">{activeShift.name}</span>
                                  <span className="text-[9px] font-bold mt-0.5 opacity-90">{startStr} - {endStr}</span>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-gray-400">Boş</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* TOPLU VARDIYA ATAMA PANELİ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-md shadow-orange-500/20">
              <Layers className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Toplu Vardiya Atama Paneli</h4>
              <p className="text-[11px] text-gray-400 font-medium">Departman seçip istediğiniz personeller için toplu tarih aralığı ve vardiya tanımlayın.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <CustomDropdown
            label="1. Departman Seçin"
            value={bulkDeptId}
            options={departments}
            onSelect={(id) => setBulkDeptId(id)}
            placeholder="Departman Seçin..."
            icon={Building2}
          />

          <div className="relative pt-1 w-full">
            <button
              ref={bulkEmpButtonRef}
              type="button"
              disabled={!bulkDeptId || bulkEmpLoading}
              onClick={() => setIsBulkEmpOpen(!isBulkEmpOpen)}
              className={`w-full flex items-center justify-between bg-white text-gray-800 text-xs font-bold rounded-xl px-3.5 py-2.5 border transition-all cursor-pointer text-left outline-none min-h-[42px] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${isBulkEmpOpen
                  ? 'border-orange-500 ring-2 ring-orange-500/10'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <span className="truncate flex items-center gap-1.5">
                {bulkEmpLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                ) : (
                  <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                )}
                {bulkEmpButtonText}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isBulkEmpOpen ? 'rotate-180 text-orange-500' : 'text-gray-400'}`} />
            </button>

            <label className={`absolute left-3 top-[-5px] bg-white px-1.5 text-[11px] font-medium tracking-wide transition-colors duration-200 pointer-events-none select-none ${isBulkEmpOpen ? 'text-orange-500' : 'text-gray-400'
              }`}>
              2. Personel(ler) Seçin
            </label>

            {isBulkEmpOpen && bulkDeptId && (
              <div
                ref={bulkEmpDropdownRef}
                className="absolute left-0 top-[115%] min-w-[240px] w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
              >
                {bulkEmployees.length > 0 && (
                  <div className="px-2 pb-1.5 mb-1 border-b border-gray-100">
                    <button
                      type="button"
                      onClick={toggleSelectAllEmployees}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-black text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                      <span>{bulkEmployeeIds.length === bulkEmployees.length ? 'Tüm Seçimleri Kaldır' : 'Tüm Personelleri Seç'}</span>
                      {bulkEmployeeIds.length === bulkEmployees.length ? (
                        <CheckSquare className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <Square className="h-4 w-4 text-orange-400" />
                      )}
                    </button>
                  </div>
                )}

                <div className="max-h-52 overflow-y-auto px-1 space-y-0.5 scrollbar-thin">
                  {bulkEmployees.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-400 font-medium">Bu departmanda personel yok.</div>
                  ) : (
                    bulkEmployees.map((emp) => {
                      const isChecked = bulkEmployeeIds.includes(emp.id);
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleSelectEmployee(emp.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-gray-700 hover:bg-orange-50/60 hover:text-orange-600 cursor-pointer ${isChecked ? 'bg-orange-50/80 text-orange-600' : ''
                            }`}
                        >
                          <span>{emp.name} {emp.surname}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 bg-white'
                            }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <CustomDropdown
            label="3. Vardiya Türü"
            value={bulkShiftId}
            options={shifts}
            onSelect={(id) => setBulkShiftId(id)}
            placeholder="Vardiya Seçin"
            renderCustomOption={(s) => {
              const startStr = s.startTime ? s.startTime.substring(0, 5) : '';
              const endStr = s.endTime ? s.endTime.substring(0, 5) : '';
              const sColor = s.colorCode || s.ColorCode;
              return (
                <div className="flex items-center gap-2.5">
                  {sColor && (
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: sColor }}
                    />
                  )}
                  <div className="flex flex-col text-left">
                    <span className="uppercase font-black">{s.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{startStr} - {endStr}</span>
                  </div>
                </div>
              );
            }}
          />

          {/* MODERN REACT-DATEPICKER İLE BAŞLANGIÇ TARİHİ */}
          <DatePickerInput
            label="Başlangıç Tarihi"
            value={bulkStartDate}
            onChange={(dateStr) => setBulkStartDate(dateStr)}
          />

          {/* MODERN REACT-DATEPICKER İLE BİTİŞ TARİHİ */}
          <DatePickerInput
            label="Bitiş Tarihi"
            value={bulkEndDate}
            onChange={(dateStr) => setBulkEndDate(dateStr)}
          />
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
              Hafta Sonu Ayarı:
            </span>

            <label
              onClick={() => setIncludeSaturday(!includeSaturday)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${includeSaturday
                  ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-xs'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
            >
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${includeSaturday ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 bg-white'
                }`}>
                {includeSaturday && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>Cumartesi Dahil Et</span>
            </label>

            <label
              onClick={() => setIncludeSunday(!includeSunday)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${includeSunday
                  ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-xs'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
            >
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${includeSunday ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 bg-white'
                }`}>
                {includeSunday && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>Pazar Dahil Et</span>
            </label>
          </div>

          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-200 pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto">
            <label
              onClick={() => setOverwriteExisting(!overwriteExisting)}
              className={`w-full sm:w-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${overwriteExisting
                  ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
            >
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${overwriteExisting ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 bg-white'
                }`}>
                {overwriteExisting && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 text-amber-600" />
                Mevcut Vardiyaların Üstüne Yaz
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <button
            type="button"
            onClick={handleBulkAssignmentSubmit}
            disabled={bulkLoading || !bulkDeptId || bulkEmployeeIds.length === 0 || !bulkShiftId || !bulkStartDate || !bulkEndDate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold rounded-xl px-7 py-3 transition-all shadow-md active:scale-[0.98] cursor-pointer min-h-[42px]"
          >
            {bulkLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Toplu Vardiya Atanıyor...</span>
              </>
            ) : (
              <>
                <Layers className="h-4 w-4 stroke-[2.5]" />
                <span>Toplu Vardiya Atamasını Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AYLIK PDF RAPOR İNDİRME PANELİ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Aylık Vardiya Çizelgesi</h4>
            <p className="text-[11px] text-gray-400 font-medium">Seçilen ay, yıl ve departmana ait vardiya çizelgesini PDF belgesi olarak tek tıkla bilgisayarınıza indirin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end pt-1">
          <CustomDropdown
            label="Yıl Seçin"
            value={reportYear}
            options={yearsList}
            onSelect={(val) => setReportYear(val)}
            placeholder="Yıl Seçin"
          />

          <CustomDropdown
            label="Ay Seçin"
            value={reportMonth}
            options={MONTHS}
            onSelect={(val) => setReportMonth(val)}
            placeholder="Ay Seçin"
          />

          <CustomDropdown
            label="Departman Seçin"
            value={reportDeptId}
            options={departments}
            onSelect={(val) => setReportDeptId(val)}
            placeholder="Departman Seçin"
          />

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading || !reportDeptId}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 text-xs font-bold rounded-xl px-5 py-2.5 transition-all shadow-md active:scale-[0.98] cursor-pointer min-h-[38px]"
          >
            {pdfLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                <span>Çizelge Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>İndir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PORTAL SEÇİM POPUP KATMANI (TEK HÜCRE İÇİN) */}
      {dropdownConfig && createPortal(
        <div
          ref={cellDropdownRef}
          style={{
            position: 'absolute',
            top: `${dropdownConfig.position.top}px`,
            left: `${dropdownConfig.position.left}px`,
            width: `${Math.max(dropdownConfig.position.width, 240)}px`,
          }}
          className="bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-150 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 pb-2 border-b border-gray-50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vardiya Seçimi</span>
          </div>

          <div className="max-h-52 overflow-y-auto mt-1 space-y-0.5 px-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => handleShiftChange(dropdownConfig.empId, "", dropdownConfig.currentAssignment, dropdownConfig.day)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-gray-500 hover:bg-gray-50 ${!dropdownConfig.currentAssignment ? 'bg-gray-50/70 text-orange-600' : ''}`}
            >
              <span>Boş</span>
              {!dropdownConfig.currentAssignment && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </button>

            {shifts.map((s) => {
              const sStart = s.startTime ? s.startTime.substring(0, 5) : '';
              const sEnd = s.endTime ? s.endTime.substring(0, 5) : '';
              const sColor = s.colorCode || s.ColorCode;
              const isSelected = dropdownConfig.currentAssignment?.shiftId === s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleShiftChange(dropdownConfig.empId, s.id, dropdownConfig.currentAssignment, dropdownConfig.day)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-gray-700 hover:bg-orange-50/60 hover:text-orange-600 cursor-pointer ${isSelected ? 'bg-orange-50 text-orange-600' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    {sColor && (
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: sColor }}
                      />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-extrabold uppercase">{s.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium mt-0.5">{sStart} - {sEnd}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}