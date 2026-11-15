import { useEffect, useState } from 'react';
import { currentTheme, nextTheme, saveTheme } from '../theme.js';

// The light/dark button in the header. It shows the theme you would switch to:
// a moon while the page is light, a sun while it is dark.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);
  const other = nextTheme(theme);

  // If nothing is saved and the device itself changes (e.g. dark at sunset), keep the icon right.
  useEffect(() => {
    const device = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setTheme(currentTheme());
    device.addEventListener('change', update);
    return () => device.removeEventListener('change', update);
  }, []);

  function handleClick() {
    saveTheme(other);
    setTheme(other);
  }

  return (
    <button type="button" className="theme-toggle" onClick={handleClick} aria-label={`Switch to ${other} theme`}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {other === 'dark' ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
