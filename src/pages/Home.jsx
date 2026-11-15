import { Link } from 'react-router';
import { useAuth } from '../AuthContext.jsx';
import fabricPhoto from '../assets/fabric-offcuts.jpg';
import marketPhoto from '../assets/market-produce.jpg';
import sawdustPhoto from '../assets/workshop-sawdust.jpg';
import { formatKg } from '../helpers.js';
import { useApi } from '../useApi.js';

// What leftovers become: one photo and a short explanation each.
const REUSES = [
  {
    photo: sawdustPhoto,
    alt: 'A carpenter pushes a plank through a planing machine, with fresh sawdust piled on the machine.',
    title: 'Sawdust becomes fuel',
    text: 'Carpenters sweep up sawdust every day. Briquette makers press it into cooking fuel, and poultry farmers use it as bedding.',
  },
  {
    photo: fabricPhoto,
    alt: 'A heap of colourful fabric scraps on a wooden floor, with more offcuts in cardboard boxes behind it.',
    title: 'Offcuts become new products',
    text: 'Tailors are left with small pieces of fabric. Upcyclers sew them into bags, mats and quilts.',
  },
  {
    photo: marketPhoto,
    alt: 'A market trader at her stall of tomatoes, peppers and okra.',
    title: 'Food waste becomes feed',
    text: 'Markets throw out spoiled fruit and vegetables. Insect farms turn it into protein for animal feed.',
  },
];

// Who does each step: "seller" steps are amber, "buyer" steps teal, "both" is half and half.
const STEPS = [
  { who: 'seller', label: 'Seller', text: 'A business lists its leftovers: what, how much, and until when.' },
  { who: 'buyer', label: 'Buyer', text: 'A business that can use them requests the material it needs.' },
  { who: 'app', label: 'ByProduct', text: 'ByProduct suggests the nearest sellers and how much to ask each one for.' },
  { who: 'both', label: 'Seller, then buyer', text: 'The seller accepts, and the buyer collects. Only collected kilos count.' },
];

// The landing page: what ByProduct is, why it matters and how it works.
export default function Home() {
  const { business, loading: checkingLogin } = useAuth();
  const impact = useApi('/impact/');

  return (
    <>
      <section className="hero">
        <h1>One business's waste is another business's raw material.</h1>
        <p className="hero-text">
          ByProduct connects Nairobi businesses that have leftovers, like sawdust, fabric offcuts and
          market food waste, with nearby businesses that can use them.
        </p>
        <div className="actions">
          <Link className="button primary" to="/browse">Browse materials</Link>
          {/* While a saved login is being checked, show only the first button. */}
          {checkingLogin ? null : business ? (
            <Link className="button ghost" to="/dashboard">Go to my dashboard</Link>
          ) : (
            <Link className="button ghost" to="/sign-up">Sign up</Link>
          )}
        </div>
      </section>

      <section className="home-section">
        <h2>Why it matters</h2>
        <p className="lead">
          Useful leftovers are often dumped or burned because the businesses that could use them don't
          know where to find them.
        </p>
        <div className="card-grid">
          {REUSES.map((reuse) => (
            <article key={reuse.title} className="card photo-card">
              <img src={reuse.photo} alt={reuse.alt} loading="lazy" />
              <h3>{reuse.title}</h3>
              <p>{reuse.text}</p>
            </article>
          ))}
        </div>
        {/* The live total from the API. Nothing shows while it loads or if it fails. */}
        {impact.data && (
          <p className="impact-line">
            <strong>{formatKg(impact.data.total_kg)}</strong> reused so far through ByProduct.{' '}
            <Link to="/impact">See the impact</Link>
          </p>
        )}
      </section>

      <section className="home-section">
        <h2>How it works</h2>
        <ol className="steps">
          {STEPS.map((step) => (
            <li key={step.text} className={`card step ${step.who}`}>
              <p className="meta step-who">{step.label}</p>
              <p className="step-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section start-cards">
        <article className="card start-card seller">
          <h2>I have leftovers</h2>
          <p>List what you have. Nearby businesses send you requests, and you choose which to accept.</p>
          <div className="actions">
            <Link className="button seller" to="/listings/new">List waste</Link>
          </div>
        </article>
        <article className="card start-card buyer">
          <h2>I need material</h2>
          <p>See what businesses near you have, and request what you can use.</p>
          <div className="actions">
            <Link className="button primary" to="/browse">Browse materials</Link>
          </div>
        </article>
      </section>
    </>
  );
}
