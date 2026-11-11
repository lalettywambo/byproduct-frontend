import { useState } from 'react';
import { api, errorMessages, getAll } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import BusinessFields from '../components/BusinessFields.jsx';
import ErrorList from '../components/ErrorList.jsx';
import { LOADING_TEXT, splitErrors } from '../helpers.js';
import { useApi } from '../useApi.js';

const NO_ERRORS = { fields: {}, general: [] };

export default function Profile() {
  const { business, setBusiness, logout, deleteAccount } = useAuth();
  const areas = useApi('/areas/', getAll);

  // Start the form with the business as it is now. The select needs the area's id.
  const [form, setForm] = useState({
    name: business.name,
    kind: business.kind,
    area: String(business.area.id),
    phone: business.phone,
  });
  const [errors, setErrors] = useState(NO_ERRORS);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState([]);

  function setField(field, value) {
    setForm({ ...form, [field]: value });
    setNotice('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors(NO_ERRORS);
    setNotice('');
    try {
      const updated = await api('/me/', { method: 'PATCH', body: form });
      setBusiness(updated); // so the rest of the app sees the new details
      setNotice('Your details are saved.');
    } catch (error) {
      setErrors(splitErrors(error, ['name', 'kind', 'area', 'phone']));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    const sure = window.confirm(
      "Are you sure? This deletes your business, its listings and its needs. It can't be undone.",
    );
    if (!sure) return;
    setDeleteErrors([]);
    try {
      await deleteAccount();
    } catch (error) {
      setDeleteErrors(errorMessages(error));
    }
  }

  return (
    <section className="narrow">
      <h1>My business</h1>

      {areas.loading && <p className="loading">{LOADING_TEXT}</p>}
      <ErrorList messages={areas.error && errorMessages(areas.error)} />

      <form className="card form" onSubmit={handleSubmit}>
        <BusinessFields form={form} onChange={setField} errors={errors.fields} areas={areas.data || []} />
        <ErrorList messages={errors.general} />
        {notice && <p className="notice" role="status">{notice}</p>}
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="card stack">
        <h2>Leaving</h2>
        <button type="button" className="button ghost" onClick={logout}>Log out</button>
        <ErrorList messages={deleteErrors} />
        <button type="button" className="button warn" onClick={handleDelete}>Delete my account</button>
      </div>
    </section>
  );
}
