import { useState } from 'react';
import { errorMessages } from '../api.js';
import ErrorList from './ErrorList.jsx';

// A button that calls the API, e.g. Accept or Withdraw. It shows "…" while working,
// shows any error right under itself, and on success calls onDone(message).
//   run         - an async function that does the request and returns the message to show
//   confirmText - optional: ask "Are you sure?" first
export default function ActionButton({ className, children, run, onDone, confirmText }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);

  async function handleClick() {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setErrors([]);
    try {
      const message = await run();
      onDone(message);
    } catch (error) {
      setErrors(errorMessages(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="action">
      <button type="button" className={`button ${className}`} onClick={handleClick} disabled={busy}>
        {busy ? 'Working…' : children}
      </button>
      <ErrorList messages={errors} />
    </div>
  );
}
