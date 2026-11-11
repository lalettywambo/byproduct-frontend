import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../AuthContext.jsx';
import ErrorList from '../components/ErrorList.jsx';
import FieldError from '../components/FieldError.jsx';
import { splitErrors } from '../helpers.js';

const NO_ERRORS = { fields: {}, general: [] };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // RequireAuth puts the page they wanted in location.state.from.
  const from = location.state?.from || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(NO_ERRORS);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser reloading the page
    setBusy(true);
    setErrors(NO_ERRORS);
    try {
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
      <form className="card form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
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
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={errors.fields.password ? 'password-error' : undefined}
          required
        />
        <FieldError id="password-error" messages={errors.fields.password} />

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
