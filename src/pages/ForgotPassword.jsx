import { useState } from 'react';
import { Link } from 'react-router';
import { requestPasswordReset } from '../api.js';
import ErrorList from '../components/ErrorList.jsx';
import FieldError from '../components/FieldError.jsx';
import { splitErrors } from '../helpers.js';

const NO_ERRORS = { fields: {}, general: [] };

// The same sentence for every email, so nobody can find out which emails have accounts.
const SENT = 'If that email has an account, we have sent a reset link. Check your spam folder. It expires in 1 hour.';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState(NO_ERRORS);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors(NO_ERRORS);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      // Only when the request itself failed: no internet, or too many tries this hour.
      setErrors(splitErrors(error, ['email']));
    }
    setBusy(false);
  }

  return (
    <section className="narrow">
      <h1>Forgot your password?</h1>
      {sent ? (
        <p className="notice" role="status">{SENT}</p>
      ) : (
        <>
          <p className="lead">Enter the email you signed up with and we will send you a link to choose a new password.</p>
          <form className="card form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={errors.fields.email ? 'email-error' : undefined}
              required
            />
            <FieldError id="email-error" messages={errors.fields.email} />

            <ErrorList messages={errors.general} />
            <button type="submit" className="button primary" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </>
      )}
      <p>
        <Link to="/login">Back to log in</Link>
      </p>
    </section>
  );
}
