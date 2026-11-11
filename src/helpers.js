// Small helpers for showing API data, used by many pages.
import { api, ApiError, errorMessages } from './api';

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

// 2.14 -> "2.1 km away". Sellers in the same area as you are 0 km apart.
export function formatDistance(km) {
  if (km < 0.05) return 'Same area';
  return `${km.toFixed(1)} km away`;
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

// Why a listing is or isn't live. The API only says is_live, so we work out the reason.
// Dates in "YYYY-MM-DD" form can be compared as text.
export function listingStatus(listing) {
  if (listing.is_live) return 'Live';
  if (listing.available_until < today()) return 'Expired';
  if (listing.kg_left <= 0) return 'All promised';
  return 'Withdrawn';
}

// For pages that load one need or listing. The API answers 404 both when it was deleted
// and when it belongs to another business, so we explain both in plain words.
export function loadErrorMessages(error) {
  if (error instanceof ApiError && error.status === 404) {
    return ["We couldn't find this. It may have been deleted, or it belongs to another business."];
  }
  return errorMessages(error);
}

// For action buttons: POST to e.g. /pickups/3/accept/ and return the API's "message".
export async function postAction(path) {
  const data = await api(path, { method: 'POST' });
  return data.message;
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
