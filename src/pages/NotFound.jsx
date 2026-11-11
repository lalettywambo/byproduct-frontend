import { Link } from 'react-router';

export default function NotFound() {
  return (
    <section className="narrow">
      <h1>Page not found</h1>
      <p>There's nothing at this address.</p>
      <Link className="button primary" to="/">Browse leftovers</Link>
    </section>
  );
}
