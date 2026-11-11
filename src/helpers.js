// Small helpers for showing API data, used by many pages.
import { ApiError, errorMessages } from './api';

export const LOADING_TEXT = 'Loading… the server can take up to a minute to wake up.';

// 1070 -> "1,070 kg"
export function formatKg(kg) {
  return `${kg.toLocaleString('en-US')} kg`;
}

// 0 -> "Free", 50 and "sack" -> "KSh 50 per sack"
export function formatPrice(price, unit) {
  if (price === 0) return 'Free';
  return `KSh ${price.toLocaleString('en-US')} per ${unit}`;
}

// A listing's amount: "25 sacks (about 300 kg)" or "220 kg"
export function formatQuantity(listing) {
  if (listing.unit === 'sack') {
    const sacks = listing.quantity === 1 ? '1 sack' : `${listing.quantity.toLocaleString('en-US')} sacks`;
    return `${sacks} (about ${formatKg(listing.kg)})`;
  }
  return formatKg(listing.kg);
}

export const CONDITIONS = { sorted: 'Clean and sorted', mixed: 'Mixed' };

// "2026-11-17" -> "17 Nov 2026". Built from the parts so the browser doesn't treat it as UTC.
export function formatDate(text) {
  const [year, month, day] = text.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Today in local time as "YYYY-MM-DD" (the en-CA format), for <input type="date" min=...>.
export function today() {
  return new Date().toLocaleDateString('en-CA');
}

// Split an API error for a form:
//   fields  - { fieldName: ["message", ...] } shown under each input
//   general - sentences shown above the submit button (detail, non_field_errors,
//             or errors for fields this form doesn't have)
export function splitErrors(error, formFields) {
  if (!(error instanceof ApiError) || !error.data || error.data.detail) {
    return { fields: {}, general: errorMessages(error) };
  }
  const fields = {};
  const general = [];
  for (const [field, messages] of Object.entries(error.data)) {
    const list = [].concat(messages);
    if (formFields.includes(field)) fields[field] = list;
    else if (field === 'non_field_errors') general.push(...list);
    else general.push(`${field}: ${list.join(' ')}`);
  }
  return { fields, general };
}
