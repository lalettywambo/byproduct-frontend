import { useState } from 'react';

// A password box with a Show/Hide button, so people can check what they typed.
// onChange(value) gets the new text. describedBy = the id of its hint or error message.
export default function PasswordInput({ id, value, onChange, autoComplete, describedBy }) {
  const [shown, setShown] = useState(false);

  return (
    <div className="password-row">
      <input
        id={id}
        type={shown ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={describedBy}
        required
      />
      <button
        type="button"
        className="button ghost"
        onClick={() => setShown(!shown)}
        aria-label={shown ? 'Hide password' : 'Show password'}
      >
        {shown ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
