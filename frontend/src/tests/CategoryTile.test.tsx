import React from 'react';
import { describe, it, expect } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { CategoryTile } from '../components/ui/CategoryTile';
import { Scale } from 'lucide-react';

describe('CategoryTile Component Accessibility & Selection', () => {
  it('renders with role="radio" and reflects aria-checked state', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let selected = false;
    const handleSelect = () => {
      selected = true;
    };

    await act(async () => {
      root.render(
        <CategoryTile
          id="judge"
          nameEn="Judge / Bench"
          nameLocal="न्यायाधीश"
          desc="Urgency-ranked cause list and one-page briefs"
          icon={<Scale className="w-5 h-5" />}
          selected={false}
          onSelect={handleSelect}
        />
      );
    });

    const tile = container.querySelector('[role="radio"]');
    expect(tile).not.toBeNull();
    expect(tile?.getAttribute('aria-checked')).toBe('false');
    expect(tile?.textContent).toContain('Judge / Bench');
    expect(tile?.textContent).toContain('न्यायाधीश');

    // Simulate click
    await act(async () => {
      tile?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(selected).toBe(true);

    // Re-render as selected
    await act(async () => {
      root.render(
        <CategoryTile
          id="judge"
          nameEn="Judge / Bench"
          nameLocal="न्यायाधीश"
          desc="Urgency-ranked cause list and one-page briefs"
          icon={<Scale className="w-5 h-5" />}
          selected={true}
          onSelect={handleSelect}
        />
      );
    });

    expect(tile?.getAttribute('aria-checked')).toBe('true');
    expect(tile?.className).toContain('border-[#0B2A5B]');

    root.unmount();
    container.remove();
  });
});
