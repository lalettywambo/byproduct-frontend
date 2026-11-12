import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { api, errorMessages } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ActionButton from '../components/ActionButton.jsx';
import ErrorList from '../components/ErrorList.jsx';
import Notice from '../components/Notice.jsx';
import PickupRow from '../components/PickupRow.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import {
  formatDate, formatDistance, formatKg, loadErrorMessages, LOADING_TEXT, postAction,
} from '../helpers.js';
import { useApi } from '../useApi.js';
import { usePolling } from '../usePolling.js';

// The buyer's main screen for one need: progress, sellers to ask, and the requests already sent.
export default function NeedPage() {
  const { id } = useParams();
  const { business } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const need = useApi(`/needs/${id}/`);
  const plan = useApi(`/needs/${id}/suggestions/`);
  // Check for the sellers' answers every 10 seconds.
  usePolling(need.reload, need.loading);
  usePolling(plan.reload, plan.loading);
  // The need form sends us here with a notice like "Need saved."
  const [notice, setNotice] = useState(location.state?.notice || '');

  // Then clear it from the browser history, so reloading the page doesn't show it again.
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  // After any button works: show its message and load the need and suggestions again.
  function done(message) {
    setNotice(message);
    need.reload();
    plan.reload();
  }

  if (!need.data) {
    return (
      <>
        <h1>Need</h1>
        {need.error ? (
          <>
            <ErrorList messages={loadErrorMessages(need.error)} />
            <Link className="button ghost" to="/dashboard">Back to dashboard</Link>
          </>
        ) : (
          <p className="loading">{LOADING_TEXT}</p>
        )}
      </>
    );
  }

  const n = need.data;

  async function deleteNeed() {
    await api(`/needs/${n.id}/`, { method: 'DELETE' }); // 204: no message, so we write our own
    return 'Need deleted.';
  }

  return (
    <>
      <p className="meta buyer-label need-eyebrow">
        I need {n.material.name} {n.closed && <span className="tag">Closed</span>}
      </p>
      <h1>{formatKg(n.kg)} {n.material.name}</h1>
      <p className="lead">
        Needed by {formatDate(n.needed_by)}
        {n.note && ` · ${n.note}`}
      </p>

      <div className="card">
        <ProgressBar need={n} />
      </div>

      {n.closed ? (
        <p className="empty">This need is closed. Agreed pickups below can still be collected.</p>
      ) : (
        <section className="dash-section">
          <h2>Sellers to ask</h2>
          <DistanceSelect need={n} onDone={done} />
          <Suggestions need={n} plan={plan} onDone={done} />
        </section>
      )}

      <section className="dash-section">
        <h2>My requests</h2>
        {n.pickups.length === 0 ? (
          <p className="empty">You haven't asked any seller yet.</p>
        ) : (
          <div className="card-grid">
            {n.pickups.map((pickup) => (
              <PickupRow key={pickup.id} pickup={pickup} viewerId={business.id} onDone={done} />
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>This need</h2>
        <div className="actions">
          {!n.closed && (
            <>
              <Link className="button ghost" to={`/needs/${n.id}/edit`}>Edit</Link>
              <ActionButton
                className="warn"
                run={() => postAction(`/needs/${n.id}/close/`)}
                onDone={done}
                confirmText="Close this need? Requests still waiting for an answer will be cancelled."
              >
                Close need
              </ActionButton>
            </>
          )}
          <ActionButton
            className="warn"
            run={deleteNeed}
            onDone={(message) => navigate('/dashboard', { state: { notice: message } })}
            confirmText="Delete this need? This can't be undone."
          >
            Delete
          </ActionButton>
        </div>
      </section>

      <Notice message={notice} setMessage={setNotice} />
    </>
  );
}

// "Sellers within" 5, 10 or 20 km. Changing it saves straight away (PATCH max_km).
function DistanceSelect({ need, onDone }) {
  const [km, setKm] = useState(String(need.max_km)); // what the select shows while saving
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);

  async function handleChange(event) {
    const value = event.target.value;
    setKm(value);
    setBusy(true);
    setErrors([]);
    try {
      await api(`/needs/${need.id}/`, { method: 'PATCH', body: { max_km: Number(value) } });
      onDone(`Now showing sellers within ${value} km.`);
    } catch (error) {
      setKm(String(need.max_km)); // put it back to what's saved
      setErrors(errorMessages(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="distance">
      <label htmlFor="distance">Sellers within</label>
      <select id="distance" value={km} onChange={handleChange} disabled={busy}>
        <option value="5">5 km</option>
        <option value="10">10 km</option>
        <option value="20">20 km</option>
      </select>
      <ErrorList messages={errors} />
    </div>
  );
}

// The sellers ByProduct suggests, nearest first, with how much to ask each one for.
function Suggestions({ need, plan, onDone }) {
  if (plan.error) {
    return (
      <>
        <ErrorList messages={errorMessages(plan.error)} />
        <button type="button" className="button ghost" onClick={plan.reload}>Try again</button>
      </>
    );
  }
  if (!plan.data) return <p className="loading">{LOADING_TEXT}</p>;

  const { suggestions, covered_kg, still_needed } = plan.data;
  if (still_needed === 0) {
    return <p className="empty">You've asked for everything you need. Wait for the sellers to answer below.</p>;
  }
  if (suggestions.length === 0) {
    return (
      <p className="empty">
        No seller within {need.max_km} km has {need.material.name.toLowerCase()} free right now.
        {need.max_km < 20 && ' Try a wider distance.'}
      </p>
    );
  }

  return (
    <>
      <p>
        {suggestions.length === 1 ? '1 seller' : `${suggestions.length} sellers`} can cover{' '}
        <strong>{formatKg(covered_kg)}</strong> of the {formatKg(still_needed)} you still need.
      </p>
      {suggestions.length > 1 && (
        <div className="actions">
          <ActionButton className="primary" run={() => postAction(`/needs/${need.id}/ask-all/`)} onDone={onDone}>
            Ask all suggested ({formatKg(covered_kg)})
          </ActionButton>
        </div>
      )}
      <div className="card-grid">
        {suggestions.map((s) => (
          <SuggestionCard key={s.listing.id} need={need} suggestion={s} onDone={onDone} />
        ))}
      </div>
    </>
  );
}

function SuggestionCard({ need, suggestion, onDone }) {
  const { seller, listing, km, kg_left, suggested_kg } = suggestion;

  // POST /pickups/ answers with the new pickup, not a message, so we write our own.
  async function ask() {
    await api('/pickups/', { method: 'POST', body: { need: need.id, listing: listing.id, kg: suggested_kg } });
    return `Asked ${seller.name} for ${formatKg(suggested_kg)}.`;
  }

  return (
    <article className="card suggestion-card">
      <div className="row-head">
        <p className="row-text"><strong>{seller.name}</strong></p>
        <span className="tag">{formatDistance(km)}</span>
      </div>
      <p className="meta">{seller.area.name} · {formatKg(kg_left)} free</p>
      <div className="actions">
        <ActionButton className="ghost" run={ask} onDone={onDone}>
          Ask for {formatKg(suggested_kg)}
        </ActionButton>
      </div>
    </article>
  );
}
