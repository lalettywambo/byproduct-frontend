// The API's message for one form field, shown under its input.
// The input points to it with aria-describedby={id}, so screen readers read it too.
export default function FieldError({ id, messages }) {
  if (!messages || messages.length === 0) return null;
  return (
    <p id={id} className="field-error">
      {messages.join(' ')}
    </p>
  );
}
