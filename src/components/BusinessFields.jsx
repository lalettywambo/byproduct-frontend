import FieldError from './FieldError.jsx';

// The kinds used by the demo businesses. People can still type their own.
const KINDS = [
  'carpenter', 'upholsterer', 'timber yard', 'tailor', 'market traders',
  'briquette maker', 'poultry farmer', 'upcycler', 'insect farm',
];

// Business name, kind, area and phone: shared by Sign up and Profile.
// form = the current values, onChange(field, value) updates one, errors = the API's field errors.
export default function BusinessFields({ form, onChange, errors, areas }) {
  // Only point to the error message when there is one.
  const describedBy = (field) => (errors[field] ? `${field}-error` : undefined);

  return (
    <>
      <label htmlFor="name">Business name</label>
      <input
        id="name"
        value={form.name}
        onChange={(e) => onChange('name', e.target.value)}
        aria-describedby={describedBy('name')}
        required
      />
      <FieldError id="name-error" messages={errors.name} />

      <label htmlFor="kind">What kind of business?</label>
      <input
        id="kind"
        list="kind-options"
        value={form.kind}
        onChange={(e) => onChange('kind', e.target.value)}
        aria-describedby={describedBy('kind')}
        placeholder="e.g. carpenter"
        required
      />
      <datalist id="kind-options">
        {KINDS.map((kind) => (
          <option key={kind} value={kind} />
        ))}
      </datalist>
      <FieldError id="kind-error" messages={errors.kind} />

      <label htmlFor="area">Area</label>
      <select
        id="area"
        value={form.area}
        onChange={(e) => onChange('area', e.target.value)}
        aria-describedby={describedBy('area')}
        required
      >
        <option value="">Choose your area</option>
        {areas.map((area) => (
          <option key={area.id} value={area.id}>{area.name}</option>
        ))}
      </select>
      <FieldError id="area-error" messages={errors.area} />

      <label htmlFor="phone">Phone</label>
      <input
        id="phone"
        type="tel"
        value={form.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        aria-describedby={describedBy('phone') || 'phone-hint'}
        required
      />
      <p id="phone-hint" className="hint">Only shared with businesses you agree a pickup with.</p>
      <FieldError id="phone-error" messages={errors.phone} />
    </>
  );
}
