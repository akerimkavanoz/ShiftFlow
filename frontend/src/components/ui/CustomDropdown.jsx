import React, { useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';

export default function CustomDropdown({
  label,
  value,
  options = [],
  onSelect,
  placeholder = "Seçiniz...",
  icon: Icon,
  disabled = false,
  error = "",
  getOptionLabel = (opt) => opt?.name ?? opt?.label ?? String(opt),
  getOptionValue = (opt) => opt?.id ?? opt?.value ?? String(opt),
  renderCustomOption
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), buttonRef);

  const selectedOption = options.find(
    (opt) => String(getOptionValue(opt)) === String(value)
  );

  const selectedText = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  return (
    <div className="relative pt-1 min-w-[140px] w-full">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white text-gray-800 text-xs font-bold rounded-xl px-3.5 py-3.5 border transition-all cursor-pointer text-left outline-none min-h-[42px] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-500 ring-2 ring-rose-500/10'
            : isOpen
            ? 'border-orange-500 ring-2 ring-orange-500/10'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className="truncate flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
          {selectedText}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-orange-500' : 'text-gray-400'
          }`}
        />
      </button>

      {label && (
        <label
          className={`absolute left-3 top-[-5px] bg-white px-1.5 text-[11px] font-medium tracking-wide transition-colors duration-200 pointer-events-none select-none ${
            error ? 'text-rose-500' : isOpen ? 'text-orange-500' : 'text-gray-400'
          }`}
        >
          {label}
        </label>
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-[115%] w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
        >
          <div className="max-h-48 overflow-y-auto px-1 space-y-0.5 scrollbar-thin">
            {options.map((opt) => {
              const optVal = getOptionValue(opt);
              const optLabel = getOptionLabel(opt);
              const isSelected = String(optVal) === String(value);

              return (
                <button
                  key={optVal}
                  type="button"
                  onClick={() => {
                    onSelect(String(optVal));
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-gray-700 hover:bg-orange-50/60 hover:text-orange-600 cursor-pointer ${
                    isSelected ? 'bg-orange-50 text-orange-600 font-black' : ''
                  }`}
                >
                  {renderCustomOption ? (
                    renderCustomOption(opt, isSelected)
                  ) : (
                    <span>{optLabel}</span>
                  )}
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <span className="text-xs font-semibold text-rose-500 pl-1 mt-1 block">{error}</span>}
    </div>
  );
}