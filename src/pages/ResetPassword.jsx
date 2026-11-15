import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError, resetPassword } from '../api.js';
import ErrorList from '../components/ErrorList.jsx';
import FieldError from '../components/FieldError.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { passwordMismatch, splitErrors } from '../helpers.js';

const NO_ERRORS = { fields: {}, general: [] };

// The page the emailed link opens: /reset-password/<uid>/<token>.
export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState(NO_ERRORS);
  const [badLink, setBadLink] = useState(''); // the API's message when the link is wrong, used or too old
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const mismatch = passwordMismatch(password, confirm);
    if (mismatch) {
      setErrors({ fields: { confirm: [mismatch] }, general: [] });
      return;
    }
    setBusy(true);
    setErrors(NO_ERRORS);
    try {
      await resetPassword(uid, token, password);
      navigate('/login', { replace: true, state: { message: 'Password updated, please log in.' } });
    } catch (error) {
      // A 400 with "detail" is about the link itself; field errors are about the new password.
      if (error instanceof ApiError && error.status === 400 && error.data?.detail) setBadLink(error.data.detail);
      else setErrors(splitErrors(error, ['password']));
      setBusy(false);
    }
  }

  if (badLink) {
    return (
      <section className="narrow">
        <h1>Choose a new password</h1>
        <ErrorList messages={[badLink]} />
        <p>
          <Link to="/forgot-password" className="button primary">Request a new link</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="narrow">
      <h1>Choose a new password</h1>
      <form className="card form" onSubmit={handleSubmit}>
        <label htmlFor="password">New password</label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          describedBy={errors.fields.password ? 'password-error' : 'password-hint'}
        />
        <p id="password-hint" className="hint">At least 8 characters, not only numbers.</p>
        <FieldError id="password-error" messages={errors.fields.password} />

        <label htmlFor="confirm">Type the new password again</label>
        <PasswordInput
          id="confirm"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
          describedBy={errors.fields.confirm ? 'confirm-error' : undefined}
        />
        <FieldError id="confirm-error" messages={errors.fields.confirm} />

        <ErrorList messages={errors.general} />
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </section>
  );
}
