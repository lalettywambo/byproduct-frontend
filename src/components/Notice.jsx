import { useEffect } from 'react';

// A short message at the bottom of the screen after an action, e.g. "Declined.".
// It hides itself after 6 seconds. setMessage('') hides it.
export default function Notice({ message, setMessage }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 6000);
    return () => clearTimeout(timer); // a new message starts a new 6 seconds
  }, [message, setMessage]);

  // The empty box stays on the page so screen readers announce each new message.
  return (
    <div className="notice-bar" role="status">
      {message && (
        <p className="notice">
          {message}
          <button type="button" className="notice-close" onClick={() => setMessage('')} aria-label="Close message">
            ✕
          </button>
        </p>
      )}
    </div>
  );
}
