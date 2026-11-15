// Tests for the theme helpers. Run with: npm test
import { describe, expect, test } from 'vitest';
import { nextTheme, pickTheme } from './theme.js';

describe('nextTheme', () => {
  test('light switches to dark and dark to light', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });
});

describe('pickTheme', () => {
  test('a saved choice wins over the device setting', () => {
    expect(pickTheme('light', true)).toBe('light');
    expect(pickTheme('dark', false)).toBe('dark');
  });
  test('with nothing saved it follows the device', () => {
    expect(pickTheme(undefined, true)).toBe('dark');
    expect(pickTheme(undefined, false)).toBe('light');
    expect(pickTheme(null, false)).toBe('light');
  });
  test('a saved value that is not a theme is ignored', () => {
    expect(pickTheme('blue', true)).toBe('dark');
    expect(pickTheme('', false)).toBe('light');
  });
});
