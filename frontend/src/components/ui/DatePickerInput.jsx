import React, { useState, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { MONTHS, YEARS_RANGE_COUNT } from '../../constants/appConstants';

// appConstants içerisindeki YEARS_RANGE_COUNT değerine göre dinamik yıl aralığı
const currentYear = new Date().getFullYear();
const rangeCount = typeof YEARS_RANGE_COUNT !== 'undefined' ? YEARS_RANGE_COUNT : 5;
const YEARS = Array.from({ length: rangeCount }, (_, i) => currentYear - Math.floor(rangeCount / 2) + i);

export default function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = "gg.aa.yyyy",
  error = "",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(false);
  });

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return "";
    return `${d}.${m}.${y}`;
  };

  const handleSelectDay = (day) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const currentMonthObj = MONTHS.find(m => (m.value || MONTHS.indexOf(m) + 1) === viewMonth + 1);
  const currentMonthName = currentMonthObj?.label || currentMonthObj?.name || "Ay";

  return (
    <div className="relative pt-1 w-full" ref={containerRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white text-gray-800 text-xs md:text-sm font-bold rounded-xl px-3.5 py-3.5 border transition-all cursor-pointer select-none min-h-[46px] ${
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' :
          error
            ? 'border-rose-500 ring-2 ring-rose-500/10'
            : isOpen 
            ? 'border-orange-500 ring-2 ring-orange-500/10' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={value ? "text-gray-800 font-bold" : "text-gray-400 font-medium"}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
      </div>

      {label && (
        <label className={`absolute left-3 top-[-5px] bg-white px-1.5 text-[11px] font-medium tracking-wide transition-colors duration-200 pointer-events-none select-none ${
          error ? 'text-rose-500' : isOpen ? 'text-orange-500' : 'text-gray-400'
        }`}>
          {label}
        </label>
      )}

      {isOpen && (
        <div className="absolute left-0 top-[115%] w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 gap-2 relative">
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
                else { setViewMonth(viewMonth - 1); }
              }}
              className="p-1.5 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-1.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setIsMonthDropdownOpen(!isMonthDropdownOpen); setIsYearDropdownOpen(false); }}
                  className="flex items-center gap-1 bg-gray-50 hover:bg-orange-50/50 text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                >
                  <span>{currentMonthName}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>

                {isMonthDropdownOpen && (
                  <div className="absolute left-0 top-[110%] w-36 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 max-h-40 overflow-y-auto scrollbar-thin">
                    {MONTHS.map((m, idx) => {
                      const mVal = m.value || idx + 1;
                      const mLabel = m.label || m.name || m;
                      const isSelected = viewMonth === idx;
                      return (
                        <button
                          key={mVal}
                          type="button"
                          onClick={() => { setViewMonth(idx); setIsMonthDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                            isSelected ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {mLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setIsYearDropdownOpen(!isYearDropdownOpen); setIsMonthDropdownOpen(false); }}
                  className="flex items-center gap-1 bg-gray-50 hover:bg-orange-50/50 text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                >
                  <span>{viewYear}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>

                {isYearDropdownOpen && (
                  <div className="absolute right-0 top-[110%] w-24 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 max-h-40 overflow-y-auto scrollbar-thin">
                    {YEARS.map((y) => {
                      const isSelected = viewYear === y;
                      return (
                        <button
                          key={y}
                          type="button"
                          onClick={() => { setViewYear(y); setIsYearDropdownOpen(false); }}
                          className={`w-full text-center px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                            isSelected ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {y}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
                else { setViewMonth(viewMonth + 1); }
              }}
              className="p-1.5 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
            <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const monthStr = String(viewMonth + 1).padStart(2, '0');
              const dayStr = String(dayNum).padStart(2, '0');
              const fullDateStr = `${viewYear}-${monthStr}-${dayStr}`;
              const isSelected = value === fullDateStr;
              const isToday = new Date().toISOString().split('T')[0] === fullDateStr;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' 
                      : isToday 
                      ? 'border border-orange-500 text-orange-600 bg-orange-50/50' 
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {value && (
            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Tarihi Temizle
              </button>
            </div>
          )}
        </div>
      )}

      {error && <span className="text-xs font-semibold text-rose-500 pl-1 mt-1 block">{error}</span>}
    </div>
  );
}