import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { errorMessages, getAll } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import BusinessFields from '../components/BusinessFields.jsx';
import ErrorList from '../components/ErrorList.jsx';
import FieldError from '../components/FieldError.jsx';
import { LOADING_TEXT, splitErrors } from '../helpers.js';
import { useApi } from '../useApi.js';

const FIELDS = ['username', 'password', 'name', 'kind', 'area', 'phone'];
const NO_ERRORS = { fields: {}, general: [] };

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const areas = useApi('/areas/', getAll);

  const [form, setForm] = useState({ username: '', password: '', name: '', kind: '', area: '', phone: '' });
  const [errors, setErrors] = useState(NO_ERRORS);
  const [busy, setBusy] = useState(false);

  // Change one field and keep the others.
  function setField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors(NO_ERRORS);
    try {
      await register(form);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors(splitErrors(error, FIELDS));
      setBusy(false);
    }
  }

  return (
    <section className="narrow">
      <h1>Sign up</h1>
      <p className="lead">One login per business. You can sell leftovers and post what you need.</p>

      {areas.loading && <p className="loading">{LOADING_TEXT}</p>}
      <ErrorList messages={areas.error && errorMessages(areas.error)} />

      <form className="card form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          autoComplete="username"
          value={form.username}
          onChange={(e) => setField('username', e.target.value)}
          aria-describedby={errors.fields.username ? 'username-error' : undefined}
          required
        />
        <FieldError id="username-error" messages={errors.fields.username} />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          aria-describedby={errors.fields.password ? 'password-error' : 'password-hint'}
          required
        />
        <p id="password-hint" className="hint">At least 8 characters, not only numbers.</p>
        <FieldError id="password-error" messages={errors.fields.password} />

        <BusinessFields form={form} onChange={setField} errors={errors.fields} areas={areas.data || []} />

        <ErrorList messages={errors.general} />
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Signing up…' : 'Sign up'}
        </button>
      </form>
      <p>
        Already signed up? <Link to="/login" state={location.state}>Log in</Link>
      </p>
    </section>
  );
}
