import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { UtilityBar } from '../components/layout/UtilityBar';

describe('UtilityBar Component Accessibility & Preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders skip link and screen reader access landmarks', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let lang: any = 'en';
    const setLang = (l: any) => { lang = l; };

    await act(async () => {
      root.render(
        <BrowserRouter>
          <UtilityBar language={lang} setLanguage={setLang} />
        </BrowserRouter>
      );
    });

    const skipLink = container.querySelector('a[href="#main-content"]');
    expect(skipLink).not.toBeNull();
    expect(skipLink?.textContent).toContain('Skip to main content');

    const screenReaderLink = container.querySelector('a[href="/accessibility"]');
    expect(screenReaderLink).not.toBeNull();

    // Verify contrast toggle toggles data-theme="contrast"
    const contrastBtn = container.querySelector('button[aria-label="Toggle high contrast mode"]');
    expect(contrastBtn).not.toBeNull();

    await act(async () => {
      contrastBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('contrast');
    expect(localStorage.getItem('nyayaflow_theme')).toBe('contrast');

    root.unmount();
    container.remove();
  });
});
