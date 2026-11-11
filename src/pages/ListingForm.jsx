import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api, errorMessages, getAll } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ErrorList from '../components/ErrorList.jsx';
import FieldError from '../components/FieldError.jsx';
import { formatKg, LOADING_TEXT, splitErrors, today } from '../helpers.js';
import { useApi } from '../useApi.js';

// Used for both /listings/new and /listings/:id/edit.
// This part loads what the form needs; ListingEditor below is the form itself.
export default function ListingForm() {
  const { id } = useParams(); // undefined on /listings/new
  const { business } = useAuth();
  const materials = useApi('/materials/', getAll);
  const listing = useApi(id ? `/listings/${id}/` : null);
  const title = id ? 'Edit listing' : 'List waste';

  const error = materials.error || listing.error;
  if (error) {
    return (
      <section className="narrow">
        <h1>{title}</h1>
        <ErrorList messages={errorMessages(error)} />
        <Link className="button ghost" to="/dashboard">Back to dashboard</Link>
      </section>
    );
  }
  if (materials.loading || listing.loading) {
    return (
      <section className="narrow">
        <h1>{title}</h1>
        <p className="loading">{LOADING_TEXT}</p>
      </section>
    );
  }
  if (listing.data && listing.data.seller.id !== business.id) {
    return (
      <section className="narrow">
        <h1>{title}</h1>
        <p className="empty">You can only edit your own listings.</p>
      </section>
    );
  }

  return (
    <section className="narrow">
      <h1>{title}</h1>
      {/* The form starts from the loaded listing, so it's only shown once that has arrived. */}
      <ListingEditor key={id || 'new'} listing={listing.data} materials={materials.data} />
    </section>
  );
}

const FIELDS = ['material', 'quantity', 'unit', 'condition', 'price_per_unit', 'available_until', 'description'];
const NO_ERRORS = { fields: {}, general: [] };

function ListingEditor({ listing, materials }) {
  const navigate = useNavigate();
  // Inputs work with text, so numbers are kept as strings until we send them.
  const [form, setForm] = useState(
    listing
      ? {
          material: String(listing.material.id),
          quantity: String(listing.quantity),
          unit: listing.unit,
          condition: listing.condition,
          price_per_unit: String(listing.price_per_unit),
          available_until: listing.available_until,
          description: listing.description,
        }
      : {
          material: '', quantity: '', unit: 'kg', condition: 'mixed',
          price_per_unit: '0', available_until: '', description: '',
        },
  );
  const [errors, setErrors] = useState(NO_ERRORS);
  const [busy, setBusy] = useState(false);

  function setField(field, value) {
    setForm({ ...form, [field]: value });
  }
  const describedBy = (field) => (errors.fields[field] ? `${field}-error` : undefined);

  // For sacks, show roughly how many kilos that is, using the material's sack weight.
  const material = materials.find((m) => String(m.id) === form.material);
  const sackKg = form.unit === 'sack' && material && Number(form.quantity) > 0
    ? Number(form.quantity) * material.kg_per_sack
    : null;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors(NO_ERRORS);
    const body = {
      ...form,
      material: Number(form.material),
      quantity: Number(form.quantity),
      price_per_unit: Number(form.price_per_unit),
    };
    try {
      if (listing) {
        await api(`/listings/${listing.id}/`, { method: 'PATCH', body });
      } else {
        await api('/listings/', { method: 'POST', body });
      }
      const notice = listing ? 'Listing saved.' : 'Listing posted. Buyers can see it now.';
      navigate('/dashboard', { state: { notice } });
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

      <div className="two-columns">
        <div>
          <label htmlFor="quantity">How much?</label>
          <input
            id="quantity"
            type="number"
            min="1"
            inputMode="numeric"
            value={form.quantity}
            onChange={(e) => setField('quantity', e.target.value)}
            aria-describedby={describedBy('quantity')}
            required
          />
          <FieldError id="quantity-error" messages={errors.fields.quantity} />
        </div>
        <div>
          <label htmlFor="unit">Counted in</label>
          <select
            id="unit"
            value={form.unit}
            onChange={(e) => setField('unit', e.target.value)}
            aria-describedby={describedBy('unit')}
          >
            <option value="kg">kg</option>
            <option value="sack">sacks</option>
          </select>
          <FieldError id="unit-error" messages={errors.fields.unit} />
        </div>
      </div>
      {sackKg !== null && (
        <p className="hint">
          About {formatKg(sackKg)} ({material.kg_per_sack} kg per sack of {material.name.toLowerCase()})
        </p>
      )}

      <label htmlFor="condition">Condition</label>
      <select
        id="condition"
        value={form.condition}
        onChange={(e) => setField('condition', e.target.value)}
        aria-describedby={describedBy('condition')}
      >
        <option value="sorted">Clean and sorted</option>
        <option value="mixed">Mixed</option>
      </select>
      <FieldError id="condition-error" messages={errors.fields.condition} />

      <label htmlFor="price_per_unit">Price per {form.unit} (KSh)</label>
      <input
        id="price_per_unit"
        type="number"
        min="0"
        inputMode="numeric"
        value={form.price_per_unit}
        onChange={(e) => setField('price_per_unit', e.target.value)}
        aria-describedby={describedBy('price_per_unit') || 'price-hint'}
        required
      />
      <p id="price-hint" className="hint">0 means free.</p>
      <FieldError id="price_per_unit-error" messages={errors.fields.price_per_unit} />

      <label htmlFor="available_until">Available until</label>
      <input
        id="available_until"
        type="date"
        min={today()}
        value={form.available_until}
        onChange={(e) => setField('available_until', e.target.value)}
        aria-describedby={describedBy('available_until')}
        required
      />
      <FieldError id="available_until-error" messages={errors.fields.available_until} />

      <label htmlFor="description">Notes for buyers (optional)</label>
      <textarea
        id="description"
        rows="3"
        value={form.description}
        onChange={(e) => setField('description', e.target.value)}
        aria-describedby={describedBy('description')}
        placeholder="e.g. Dry, no shavings. Collect after 4 pm."
      />
      <FieldError id="description-error" messages={errors.fields.description} />

      <ErrorList messages={errors.general} />
      <button type="submit" className="button seller" disabled={busy}>
        {busy ? 'Saving…' : listing ? 'Save changes' : 'Post listing'}
      </button>
      <Link className="button ghost" to="/dashboard">Cancel</Link>
    </form>
  );
}
