// Every request to the Django API goes through api() in this file.
// Login gives us two tokens:
//   access  - short (30 min). Kept in memory only, sent on every request.
//   refresh - long (7 days). Kept in localStorage, used to get a new access token.

const API_URL = import.meta.env.VITE_API_URL; // e.g. https://byproduct-api.onrender.com/api

let accessToken = null;
let refreshing = null; // the refresh request in progress, shared so we never refresh twice at once

export function saveTokens({ access, refresh }) {
  accessToken = access;
  if (refresh) localStorage.setItem('refresh', refresh);
}

export function clearTokens() {
  accessToken = null;
  localStorage.removeItem('refresh');
}

export function hasRefreshToken() {
  return Boolean(localStorage.getItem('refresh'));
}

export function getRefreshToken() {
  return localStorage.getItem('refresh');
}

// Swap the refresh token for a new access token. Returns true if it worked.
function refreshAccess() {
  if (!refreshing) {
    refreshing = (async () => {
      const response = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: getRefreshToken() }),
      });
      if (!response.ok) {
        clearTokens();
        return false;
      }
      saveTokens(await response.json()); // the server sends a new refresh token too
      return true;
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

// An error from the API. error.data is the JSON the server sent back.
export class ApiError extends Error {
  constructor(status, data) {
    super(data?.detail || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

// api('/listings/')                                  -> GET
// api('/listings/', { method: 'POST', body: {...} }) -> POST with JSON
export async function api(path, { method = 'GET', body } = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const send = () => {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  const tokenUsed = accessToken;
  let response = await send();

  // 401 = missing or expired access token. Get a new one once, then try again.
  if (response.status === 401 && hasRefreshToken()) {
    if (accessToken === tokenUsed) await refreshAccess();
    // Try again if the token changed: a new one, or none at all because the login ran out.
    if (accessToken !== tokenUsed) response = await send();
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

// For lists the API splits into pages ({count, next, previous, results}): fetch every page.
export async function getAll(path) {
  let items = [];
  let next = path;
  while (next) {
    const page = await api(next);
    if (Array.isArray(page)) return page; // this list isn't split into pages
    items = items.concat(page.results);
    next = page.next;
  }
  return items;
}

// Turn any error into sentences a person can read.
export function errorMessages(error) {
  if (!(error instanceof ApiError)) {
    return ["Can't reach the server. Check your internet and try again."];
  }
  const data = error.data;
  if (!data) return [error.message];
  if (data.detail) return [data.detail];
  return Object.entries(data).map(([field, messages]) => {
    const text = [].concat(messages).join(' ');
    return field === 'non_field_errors' ? text : `${field}: ${text}`;
  });
}
