import React from 'react';
import { Check } from 'lucide-react';

export interface CategoryTileProps {
  id: string;
  nameEn: string;
  nameLocal?: string;
  desc: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  tabIndex?: number;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({
  id,
  nameEn,
  nameLocal,
  desc,
  icon,
  selected,
  onSelect,
  onKeyDown,
  tabIndex = 0
}) => {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      data-testid={`category-tile-${id}`}
      className={`p-3.5 rounded border text-left cursor-pointer transition-all select-none relative flex flex-col justify-between min-h-[110px] ${
        selected
          ? 'bg-white border-[#0B2A5B] border-2 shadow-sm'
          : 'bg-[#F4F6FA] border-[#C5CCD6] hover:border-[#0B2A5B]/60 hover:bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded border ${selected ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]' : 'bg-white text-[#0B2A5B] border-[#C5CCD6]'}`}>
            {icon}
          </div>
          <div>
            <div className="text-sm font-bold text-[#0B2A5B] leading-tight">
              {nameEn}
            </div>
            {nameLocal && (
              <div className="text-xs text-[#4A4F57] font-medium leading-tight mt-0.5">
                {nameLocal}
              </div>
            )}
          </div>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="text-xs text-[#4A4F57] mt-2 leading-relaxed">
        {desc}
      </div>
    </div>
  );
};
