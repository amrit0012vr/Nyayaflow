import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';

describe('LoginPage Component Structure & Accessibility (§3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Step 1 category tiles and disables Step 2 until category is chosen', async () => {
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

    // Check heading
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toContain('User Login');

    // Check Step 1 radiogroup
    const radioGroup = container.querySelector('[role="radiogroup"]');
    expect(radioGroup).not.toBeNull();

    // Check tiles
    const tiles = container.querySelectorAll('[role="radio"]');
    expect(tiles.length).toBe(6);

    // Form inputs should be disabled initially
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(emailInput?.disabled).toBe(true);
    expect(passwordInput?.disabled).toBe(true);
    expect(submitButton?.disabled).toBe(true);

    // Select the first tile (Judge)
    await act(async () => {
      tiles[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Now inputs should be enabled
    expect(emailInput?.disabled).toBe(false);
    expect(passwordInput?.disabled).toBe(false);
    expect(submitButton?.disabled).toBe(false);

    // Heading in Step 2 updates
    expect(container.textContent).toContain('Logging in as:');

    root.unmount();
    container.remove();
  });
});
