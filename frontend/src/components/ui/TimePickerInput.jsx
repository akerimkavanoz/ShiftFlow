import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';

export default function TimePickerInput({
  id,
  label,
  value,
  onChange,
  error,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), inputRef);

  const hoursArray = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesArray = ['00', '15', '30', '45'];

  const openPicker = () => {
    if (disabled) return;
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(true);
  };

  const handleInputChange = (val) => {
    setIsOpen(false);
    let cleanVal = val.replace(/[^0-9:]/g, '');
    if (cleanVal.length === 2 && !cleanVal.includes(':')) {
      cleanVal = cleanVal + ':';
    }

    const parts = cleanVal.split(':');
    let hour = parts[0] || '';
    let minute = parts[1] || '';

    if (hour.length > 0 && parseInt(hour, 10) > 23) hour = '23';
    if (minute.length > 0 && parseInt(minute, 10) > 59) minute = '59';

    const finalTime = minute.length > 0 || cleanVal.includes(':') ? `${hour}:${minute}` : hour;
    onChange(finalTime.substring(0, 5));
  };

  const handlePanelSelect = (h, m, close) => {
    onChange(`${h}:${m}`);
    if (close) setIsOpen(false);
  };

  const currentHour = value ? value.split(':')[0] || '08' : '08';
  const currentMin = value ? value.split(':')[1] || '00' : '00';

  return (
    <div className="flex flex-col space-y-1.5 relative overflow-visible w-full">
      <div className="relative flex items-center overflow-visible">
        <input
          ref={inputRef}
          type="text"
          id={id}
          maxLength={5}
          value={value}
          onFocus={openPicker}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={isOpen ? "" : "Saat seçiniz veya yazınız"}
          className={`w-full px-4 py-3.5 pr-10 rounded-xl border bg-white text-sm md:text-base font-semibold outline-none transition-all cursor-pointer ${
            error
              ? 'border-rose-500 focus:border-rose-500'
              : isOpen
              ? 'border-orange-500 ring-4 ring-orange-500/10'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        />
        <Clock className={`absolute right-4 h-5 w-5 pointer-events-none transition-colors ${isOpen ? 'text-orange-500' : 'text-gray-400'}`} />

        <label
          htmlFor={id}
          className={`absolute left-4 bg-white px-1.5 pointer-events-none transition-all duration-200 origin-left ${
            value || isOpen ? '-top-2.5 text-xs md:text-sm font-medium' : 'top-3.5 text-base text-gray-400 opacity-0'
          } ${error ? 'text-rose-500' : isOpen ? 'text-orange-500' : 'text-gray-400'}`}
        >
          {label}
        </label>
      </div>
      {error && <span className="text-xs md:text-sm font-semibold text-rose-500 pl-1">{error}</span>}

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${Math.max(position.width, 260)}px`,
          }}
          className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-3.5 z-[9999] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-2 gap-3 h-48 overflow-visible">
            <div className="flex flex-col text-center overflow-visible">
              <span className="text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-wider">Saat</span>
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-1 bg-slate-50/50 space-y-0.5 scrollbar-thin">
                {hoursArray.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handlePanelSelect(h, currentMin, false)}
                    className={`w-full py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentHour === h ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:text-orange-500'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col text-center overflow-visible">
              <span className="text-[10px] font-black text-gray-400 uppercase mb-1.5 tracking-wider">Dakika</span>
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-1 bg-slate-50/50 space-y-0.5 scrollbar-thin">
                {minutesArray.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handlePanelSelect(currentHour, m, true)}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentMin === m ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:text-orange-500'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}