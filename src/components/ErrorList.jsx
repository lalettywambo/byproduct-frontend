// Shows a list of error sentences, e.g. from errorMessages(). Shows nothing if the list is empty.
export default function ErrorList({ messages }) {
  if (!messages || messages.length === 0) return null;
  return (
    <div className="error-box" role="alert">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
