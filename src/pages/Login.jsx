import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../AuthContext.jsx';
import ErrorList from '../components/ErrorList.jsx';
import FieldError from '../components/FieldError.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { splitErrors } from '../helpers.js';

const NO_ERRORS = { fields: {}, general: [] };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // RequireAuth puts the page they wanted in location.state.from.
  const from = location.state?.from || '/dashboard';
  // The reset page sends people here with a message, e.g. "Password updated, please log in."
  const message = location.state?.message;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(NO_ERRORS);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser reloading the page
    setBusy(true);
    setErrors(NO_ERRORS);
    try {
      // The API's "username" field takes the email or the username.
      await login(username, password);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors(splitErrors(error, ['username', 'password']));
      setBusy(false);
    }
  }

  return (
    <section className="narrow">
      <h1>Log in</h1>
      {message && <p className="notice" role="status">{message}</p>}
      <form className="card form" onSubmit={handleSubmit}>
        <label htmlFor="username">Email or username</label>
        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-describedby={errors.fields.username ? 'username-error' : undefined}
          required
        />
        <FieldError id="username-error" messages={errors.fields.username} />

        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          describedBy={errors.fields.password ? 'password-error' : undefined}
        />
        <FieldError id="password-error" messages={errors.fields.password} />
        <p className="hint">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>

        <ErrorList messages={errors.general} />
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p>
        New here? <Link to="/sign-up" state={location.state}>Sign up your business</Link>
      </p>
    </section>
  );
}
