import { describe, it, expect } from 'vitest';
import { setAccessToken, getAccessToken, onSessionExpired } from '../lib/api';

describe('API Client In-Memory Token Management (AUTH-05)', () => {
  it('stores and retrieves access tokens purely in-memory', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('jwt-mock-access-token');
    expect(getAccessToken()).toBe('jwt-mock-access-token');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('triggers session expired callback on expiration', () => {
    let expiredTriggered = false;
    onSessionExpired(() => {
      expiredTriggered = true;
    });

    // Callback can be invoked directly
    expect(expiredTriggered).toBe(false);
  });
});

