// Light and dark theme.
// The theme in use is data-theme="light" or "dark" on <html>; index.css has the colours for each.
// With no data-theme, the CSS follows the device's own light/dark setting.

// The theme the header button switches to.
export function nextTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

// A saved choice wins; otherwise follow the device.
export function pickTheme(saved, deviceIsDark) {
  if (saved === 'light' || saved === 'dark') return saved;
  return deviceIsDark ? 'dark' : 'light';
}

// The theme showing right now. index.html sets data-theme from the saved choice before the page paints.
export function currentTheme() {
  const deviceIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return pickTheme(document.documentElement.dataset.theme, deviceIsDark);
}

// Switch the page to a theme and remember it for next time.
export function saveTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Storage is blocked (e.g. private mode): the theme still changes, until the page is reloaded.
  }
}
