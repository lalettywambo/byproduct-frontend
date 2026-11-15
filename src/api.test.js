// Tests for errorMessages(), which turns any error into sentences a person can read.
import { describe, expect, test } from 'vitest';
import { ApiError, errorMessages } from './api.js';

describe('errorMessages', () => {
  test('no answer from the server (offline or blocked)', () => {
    expect(errorMessages(new TypeError('Failed to fetch'))).toEqual([
      "Can't reach the server. Check your internet and try again.",
    ]);
  });

  test('an error with no body shows the status', () => {
    expect(errorMessages(new ApiError(500, null))).toEqual(['Request failed (500)']);
  });

  test('a detail message is shown as it is', () => {
    expect(errorMessages(new ApiError(401, { detail: 'No active account found.' }))).toEqual([
      'No active account found.',
    ]);
  });

  test('field errors name the field; non_field_errors don\'t', () => {
    const error = new ApiError(400, {
      username: ['This field is required.'],
      kg: ['Must be at least 1.', 'Must be a whole number.'],
      non_field_errors: ['Passwords must match.'],
    });
    expect(errorMessages(error)).toEqual([
      'username: This field is required.',
      'kg: Must be at least 1. Must be a whole number.',
      'Passwords must match.',
    ]);
  });

  test('a single message that isn\'t a list still works', () => {
    expect(errorMessages(new ApiError(400, { phone: 'Too long.' }))).toEqual(['phone: Too long.']);
  });
});
