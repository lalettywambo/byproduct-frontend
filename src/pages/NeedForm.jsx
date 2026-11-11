import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { api, getAll } from '../api.js';
import ErrorList from '../components/ErrorList.jsx';
import FieldError from '../components/FieldError.jsx';
import { loadErrorMessages, LOADING_TEXT, splitErrors, today } from '../helpers.js';
import { useApi } from '../useApi.js';

// Used for both /needs/new and /needs/:id/edit.
// This part loads what the form needs; NeedEditor below is the form itself.
export default function NeedForm() {
  const { id } = useParams(); // undefined on /needs/new
  const [searchParams] = useSearchParams(); // ?material=1 from Browse's "Need this?" button
  const materials = useApi('/materials/', getAll);
  // Only the buyer can load their own need: anyone else gets "Not found." from the API.
  const need = useApi(id ? `/needs/${id}/` : null);
  const title = id ? 'Edit need' : 'Post a need';

  const error = materials.error || need.error;
  if (error) {
    return (
      <section className="narrow">
        <h1>{title}</h1>
        <ErrorList messages={loadErrorMessages(error)} />
        <Link className="button ghost" to="/dashboard">Back to dashboard</Link>
      </section>
    );
  }
  if (materials.loading || need.loading) {
    return (
      <section className="narrow">
        <h1>{title}</h1>
        <p className="loading">{LOADING_TEXT}</p>
      </section>
    );
  }
  if (need.data?.closed) {
    return (
      <section className="narrow">
        <h1>{title}</h1>
        <p className="empty">This need is closed, so it can't be changed.</p>
        <Link className="button ghost" to={`/needs/${id}`}>Back to the need</Link>
      </section>
    );
  }

  return (
    <section className="narrow">
      <h1>{title}</h1>
      <NeedEditor
        key={id || 'new'}
        need={need.data}
        materials={materials.data}
        startMaterial={searchParams.get('material') || ''}
      />
    </section>
  );
}

const FIELDS = ['material', 'kg', 'max_km', 'needed_by', 'note'];
const NO_ERRORS = { fields: {}, general: [] };

function NeedEditor({ need, materials, startMaterial }) {
  const navigate = useNavigate();
  // Inputs work with text, so numbers are kept as strings until we send them.
  const [form, setForm] = useState(
    need
      ? {
          material: String(need.material.id),
          kg: String(need.kg),
          max_km: String(need.max_km),
          needed_by: need.needed_by,
          note: need.note,
        }
      : { material: startMaterial, kg: '', max_km: '10', needed_by: '', note: '' },
  );
  const [errors, setErrors] = useState(NO_ERRORS);
  const [busy, setBusy] = useState(false);

  function setField(field, value) {
    setForm({ ...form, [field]: value });
  }
  const describedBy = (field) => (errors.fields[field] ? `${field}-error` : undefined);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors(NO_ERRORS);
    const body = {
      ...form,
      material: Number(form.material),
      kg: Number(form.kg),
      max_km: Number(form.max_km),
    };
    try {
      if (need) {
        await api(`/needs/${need.id}/`, { method: 'PATCH', body });
        navigate(`/needs/${need.id}`, { state: { notice: 'Need saved.' } });
      } else {
        const created = await api('/needs/', { method: 'POST', body });
        navigate(`/needs/${created.id}`, { state: { notice: 'Need posted. Here are the sellers near you.' } });
      }
    } catch (error) {
      setErrors(splitErrors(error, FIELDS));
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <label htmlFor="material">Material</label>
      <select
        id="material"
        value={form.material}
        onChange={(e) => setField('material', e.target.value)}
        aria-describedby={describedBy('material')}
        required
      >
        <option value="">Choose a material</option>
        {materials.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <FieldError id="material-error" messages={errors.fields.material} />

      <label htmlFor="kg">How many kg do you need?</label>
      <input
        id="kg"
        type="number"
        min="1"
        inputMode="numeric"
        value={form.kg}
        onChange={(e) => setField('kg', e.target.value)}
        aria-describedby={describedBy('kg')}
        required
      />
      <FieldError id="kg-error" messages={errors.fields.kg} />

      <label htmlFor="max_km">Sellers within</label>
      <select
        id="max_km"
        value={form.max_km}
        onChange={(e) => setField('max_km', e.target.value)}
        aria-describedby={describedBy('max_km')}
      >
        <option value="5">5 km</option>
        <option value="10">10 km</option>
        <option value="20">20 km</option>
      </select>
      <FieldError id="max_km-error" messages={errors.fields.max_km} />

      <label htmlFor="needed_by">Needed by</label>
      <input
        id="needed_by"
        type="date"
        min={today()}
        value={form.needed_by}
        onChange={(e) => setField('needed_by', e.target.value)}
        aria-describedby={describedBy('needed_by')}
        required
      />
      <FieldError id="needed_by-error" messages={errors.fields.needed_by} />

      <label htmlFor="note">Note for sellers (optional)</label>
      <input
        id="note"
        maxLength="200"
        value={form.note}
        onChange={(e) => setField('note', e.target.value)}
        aria-describedby={describedBy('note')}
        placeholder="e.g. Dry sawdust only"
      />
      <FieldError id="note-error" messages={errors.fields.note} />

      <ErrorList messages={errors.general} />
      <button type="submit" className="button primary" disabled={busy}>
        {busy ? 'Saving…' : need ? 'Save changes' : 'Post need'}
      </button>
      <Link className="button ghost" to={need ? `/needs/${need.id}` : '/dashboard'}>Cancel</Link>
    </form>
  );
}
