import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { api, errorMessages } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ActionButton from '../components/ActionButton.jsx';
import ErrorList from '../components/ErrorList.jsx';
import ListingCard from '../components/ListingCard.jsx';
import Notice from '../components/Notice.jsx';
import PickupRow from '../components/PickupRow.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { formatDate, formatKg, listingStatus, LOADING_TEXT, postAction } from '../helpers.js';
import { useApi } from '../useApi.js';

export default function Dashboard() {
  const { business } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const me = useApi('/me/');
  // The listing form sends us here with a notice like "Listing saved."
  const [notice, setNotice] = useState(location.state?.notice || '');

  // Then clear it from the browser history, so reloading the page doesn't show it again.
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  // After any button works: show its message and load the dashboard again.
  function done(message) {
    setNotice(message);
    me.reload();
  }

  if (!me.data) {
    return (
      <>
        <h1>Dashboard</h1>
        {me.error ? (
          <>
            <ErrorList messages={errorMessages(me.error)} />
            <button type="button" className="button ghost" onClick={me.reload}>Try again</button>
          </>
        ) : (
          <p className="loading">{LOADING_TEXT}</p>
        )}
      </>
    );
  }

  const { completed_pickups, waiting_for_answer, agreed_pickups, listings, open_needs } = me.data;
  const liveListings = listings.filter((listing) => listing.is_live);
  const pastListings = listings.filter((listing) => !listing.is_live);

  return (
    <>
      <h1>Dashboard</h1>
      <p className="lead">
        {me.data.business.name} · {completed_pickups} {completed_pickups === 1 ? 'pickup' : 'pickups'} completed
      </p>
      <div className="actions top-actions">
        <Link className="button seller" to="/listings/new">List waste</Link>
        <Link className="button primary" to="/needs/new">Post a need</Link>
      </div>

      <section className="dash-section">
        <h2>Requests waiting for your answer</h2>
        {waiting_for_answer.length === 0 ? (
          <p className="empty">No requests are waiting for you.</p>
        ) : (
          <div className="card-grid">
            {waiting_for_answer.map((pickup) => (
              <PickupRow key={pickup.id} pickup={pickup} viewerId={business.id} onDone={done} />
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>Agreed pickups</h2>
        {agreed_pickups.length === 0 ? (
          <p className="empty">No agreed pickups right now.</p>
        ) : (
          <div className="card-grid">
            {agreed_pickups.map((pickup) => (
              <PickupRow key={pickup.id} pickup={pickup} viewerId={business.id} onDone={done} />
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2>My listings</h2>
        {liveListings.length === 0 ? (
          <p className="empty">Nothing listed right now. Tap “List waste” to offer your leftovers.</p>
        ) : (
          <div className="card-grid">
            {liveListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} status="Live">
                <Link className="button ghost" to={`/listings/${listing.id}/edit`}>Edit</Link>
                <ActionButton
                  className="warn"
                  run={() => postAction(`/listings/${listing.id}/withdraw/`)}
                  onDone={done}
                >
                  Withdraw
                </ActionButton>
                <DeleteListingButton listing={listing} onDone={done} />
              </ListingCard>
            ))}
          </div>
        )}

        {pastListings.length > 0 && (
          <details className="past">
            <summary>Past listings ({pastListings.length})</summary>
            <div className="card-grid">
              {pastListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} status={listingStatus(listing)}>
                  <ActionButton
                    className="seller"
                    run={() => postAction(`/listings/${listing.id}/relist/`)}
                    onDone={done}
                  >
                    Relist for 7 days
                  </ActionButton>
                  <DeleteListingButton listing={listing} onDone={done} />
                </ListingCard>
              ))}
            </div>
          </details>
        )}
      </section>

      <section className="dash-section">
        <h2>My open needs</h2>
        {open_needs.length === 0 ? (
          <p className="empty">No open needs. Tap “Post a need” when you're looking for material.</p>
        ) : (
          <div className="card-grid">
            {open_needs.map((need) => (
              <article key={need.id} className="card need-card">
                <p className="meta buyer-label">{need.material.name}</p>
                <p className="big-number">
                  {formatKg(need.kg)} <span className="muted">by {formatDate(need.needed_by)}</span>
                </p>
                <ProgressBar need={need} />
                <div className="actions">
                  <Link className="button ghost" to={`/needs/${need.id}`}>Open need</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Notice message={notice} setMessage={setNotice} />
    </>
  );
}

// DELETE answers 204 with no body, so there's no API message: we write our own.
function DeleteListingButton({ listing, onDone }) {
  async function deleteListing() {
    await api(`/listings/${listing.id}/`, { method: 'DELETE' });
    return 'Listing deleted.';
  }
  return (
    <ActionButton
      className="warn"
      run={deleteListing}
      onDone={onDone}
      confirmText={`Delete this ${listing.material.name.toLowerCase()} listing? This can't be undone.`}
    >
      Delete
    </ActionButton>
  );
}
