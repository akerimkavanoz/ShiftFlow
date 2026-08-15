import React, { useState } from 'react';
import { CompactPicker } from 'react-color';
import { Palette } from 'lucide-react';

export default function ShiftColorPicker({ selectedColor = '#10B981', onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-1.5 relative">
      <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase">
        Vardiya Etiket Rengi
      </label>

      {/* Renk Seçme Butonu */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-xl bg-white shadow-xs hover:border-gray-400 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-lg border border-black/10 shadow-xs transition-transform"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-sm font-semibold text-gray-700 uppercase">
            {selectedColor}
          </span>
        </div>
        <Palette className="w-4 h-4 text-gray-500" />
      </button>

      {/* Popover Renk Paleti Kutusu */}
      {showPicker && (
        <div className="absolute z-50 left-0 mt-2">
          {/* Arka plana tıklayınca kapanması için şeffaf katman */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="relative z-20 shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
            <CompactPicker
              color={selectedColor}
              onChangeComplete={(color) => {
                onChange(color.hex);
                setShowPicker(false); // Renk seçilince kutuyu kapat
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}