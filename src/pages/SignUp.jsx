import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { errorMessages, getAll } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import BusinessFields from '../components/BusinessFields.jsx';
import ErrorList from '../components/ErrorList.jsx';
import FieldError from '../components/FieldError.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { LOADING_TEXT, passwordMismatch, splitErrors } from '../helpers.js';
import { useApi } from '../useApi.js';

const FIELDS = ['username', 'email', 'password', 'name', 'kind', 'area', 'phone'];
const NO_ERRORS = { fields: {}, general: [] };

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const areas = useApi('/areas/', getAll);

  const [form, setForm] = useState({
    username: '', email: '', password: '', name: '', kind: '', area: '', phone: '',
  });
  const [confirm, setConfirm] = useState(''); // the password typed again; checked here, never sent
  const [errors, setErrors] = useState(NO_ERRORS);
  const [busy, setBusy] = useState(false);

  // Change one field and keep the others.
  function setField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const mismatch = passwordMismatch(form.password, confirm);
    if (mismatch) {
      setErrors({ fields: { confirm: [mismatch] }, general: [] });
      return;
    }
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
      <p className="lead">One login per business. You can list your leftovers and request material you need.</p>

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

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          aria-describedby={errors.fields.email ? 'email-error' : 'email-hint'}
          required
        />
        <p id="email-hint" className="hint">You can log in with it, and we send a reset link here if you forget your password.</p>
        <FieldError id="email-error" messages={errors.fields.email} />

        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(value) => setField('password', value)}
          describedBy={errors.fields.password ? 'password-error' : 'password-hint'}
        />
        <p id="password-hint" className="hint">At least 8 characters, not only numbers.</p>
        <FieldError id="password-error" messages={errors.fields.password} />

        <label htmlFor="confirm">Type the password again</label>
        <PasswordInput
          id="confirm"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
          describedBy={errors.fields.confirm ? 'confirm-error' : undefined}
        />
        <FieldError id="confirm-error" messages={errors.fields.confirm} />

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
