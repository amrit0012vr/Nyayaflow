import React from 'react';
import { describe, it, expect } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import axe from 'axe-core';
import { AuthProvider } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { UtilityBar } from '../components/layout/UtilityBar';

describe('Automated WCAG 2.1 AA Accessibility Scanning (axe-core)', () => {
  it('scans UtilityBar with 0 critical or serious violations', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <BrowserRouter>
          <UtilityBar language="en" setLanguage={() => {}} />
        </BrowserRouter>
      );
    });

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);

    root.unmount();
    container.remove();
  });

  it('scans LoginPage with 0 critical or serious violations', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <BrowserRouter>
          <AuthProvider>
            <LoginPage language="en" />
          </AuthProvider>
        </BrowserRouter>
      );
    });

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      }
    });

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);

    root.unmount();
    container.remove();
  });
});
