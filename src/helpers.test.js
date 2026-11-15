// Tests for the formatting and form-error helpers. Run with: npm test
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiError } from './api.js';
import {
  formatDate, formatDistance, formatKg, formatPrice, formatQuantity,
  listingStatus, loadErrorMessages, splitErrors, today,
} from './helpers.js';

describe('formatKg', () => {
  test('adds "kg" and a comma for thousands', () => {
    expect(formatKg(0)).toBe('0 kg');
    expect(formatKg(220)).toBe('220 kg');
    expect(formatKg(1070)).toBe('1,070 kg');
  });
});

describe('formatPrice', () => {
  test('a price of 0 is "Free"', () => {
    expect(formatPrice(0, 'kg')).toBe('Free');
  });
  test('shows shillings per unit', () => {
    expect(formatPrice(50, 'sack')).toBe('KSh 50 per sack');
    expect(formatPrice(1500, 'kg')).toBe('KSh 1,500 per kg');
  });
});

describe('formatQuantity', () => {
  test('kilos are shown as kilos', () => {
    expect(formatQuantity({ unit: 'kg', quantity: 220, kg: 220 })).toBe('220 kg');
  });
  test('sacks show the count and the weight', () => {
    expect(formatQuantity({ unit: 'sack', quantity: 25, kg: 300 })).toBe('25 sacks (about 300 kg)');
  });
  test('one sack is singular', () => {
    expect(formatQuantity({ unit: 'sack', quantity: 1, kg: 12 })).toBe('1 sack (about 12 kg)');
  });
});

describe('formatDistance', () => {
  test('0 km is the same area', () => {
    expect(formatDistance(0)).toBe('Same area');
  });
  test('one decimal place', () => {
    expect(formatDistance(2.14)).toBe('2.1 km away');
    expect(formatDistance(14.5)).toBe('14.5 km away');
  });
});

describe('formatDate', () => {
  test('turns YYYY-MM-DD into a short date', () => {
    expect(formatDate('2026-11-17')).toBe('17 Nov 2026');
    expect(formatDate('2027-01-02')).toBe('2 Jan 2027');
  });
});

// today() and listingStatus() depend on the date, so these tests fix the clock to 15 Nov 2026.
describe('dates that depend on today', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 15, 10, 0)); // months count from 0, so 10 = November
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('today() is YYYY-MM-DD in local time', () => {
    expect(today()).toBe('2026-11-15');
  });

  const listing = { is_live: false, available_until: '2026-11-20', kg_left: 100 };

  test('a live listing is "Live"', () => {
    expect(listingStatus({ ...listing, is_live: true })).toBe('Live');
  });
  test('a date before today is "Expired"', () => {
    expect(listingStatus({ ...listing, available_until: '2026-11-14' })).toBe('Expired');
  });
  test('no kilos left is "All promised"', () => {
    expect(listingStatus({ ...listing, kg_left: 0 })).toBe('All promised');
  });
  test('anything else was withdrawn', () => {
    expect(listingStatus(listing)).toBe('Withdrawn');
  });
});

describe('loadErrorMessages', () => {
  test('404 gets a plain explanation', () => {
    expect(loadErrorMessages(new ApiError(404, { detail: 'Not found.' }))).toEqual([
      "We couldn't find this. It may have been deleted, or it belongs to another business.",
    ]);
  });
  test('other errors use the API message', () => {
    expect(loadErrorMessages(new ApiError(403, { detail: 'Only the buyer can do that.' }))).toEqual([
      'Only the buyer can do that.',
    ]);
  });
});

describe('splitErrors', () => {
  const FIELDS = ['kg', 'needed_by'];

  test('field errors go under their inputs', () => {
    const error = new ApiError(400, { kg: ['Must be at least 1.'], needed_by: 'Pick a later date.' });
    expect(splitErrors(error, FIELDS)).toEqual({
      fields: { kg: ['Must be at least 1.'], needed_by: ['Pick a later date.'] },
      general: [],
    });
  });

  test('non_field_errors and unknown fields go above the button', () => {
    const error = new ApiError(400, { non_field_errors: ['Something is wrong.'], phone: ['Too long.'] });
    expect(splitErrors(error, FIELDS)).toEqual({
      fields: {},
      general: ['Something is wrong.', 'phone: Too long.'],
    });
  });

  test('a detail message is general', () => {
    const error = new ApiError(400, { detail: 'This need is closed.' });
    expect(splitErrors(error, FIELDS)).toEqual({ fields: {}, general: ['This need is closed.'] });
  });

  test('no connection is general', () => {
    expect(splitErrors(new TypeError('Failed to fetch'), FIELDS)).toEqual({
      fields: {},
      general: ["Can't reach the server. Check your internet and try again."],
    });
  });
});
