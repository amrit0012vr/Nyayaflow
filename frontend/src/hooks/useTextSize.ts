import { useState, useEffect } from 'react';

export type TextSize = 'small' | 'normal' | 'large';

const TEXT_SIZE_MAP: Record<TextSize, string> = {
  small: '87.5%',
  normal: '100%',
  large: '125%'
};

export function useTextSize() {
  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nyayaflow_text_size');
      if (stored === 'small' || stored === 'normal' || stored === 'large') {
        return stored;
      }
    }
    return 'normal';
  });

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nyayaflow_text_size', size);
      document.documentElement.style.fontSize = TEXT_SIZE_MAP[size];
    }
  };

  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SIZE_MAP[textSize];
  }, [textSize]);

  return { textSize, setTextSize };
}
