import { useState } from 'react';
import { Link } from 'react-router';
import { api, errorMessages, getAll } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import ErrorList from '../components/ErrorList.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { LOADING_TEXT } from '../helpers.js';
import { useApi } from '../useApi.js';

// Home page: every live listing, filtered by material and area.
export default function Browse() {
  const { business, loading: checkingLogin } = useAuth();
  const [material, setMaterial] = useState(''); // '' = all
  const [area, setArea] = useState('');
  const materials = useApi('/materials/', getAll);
  const areas = useApi('/areas/', getAll);
  const firstPage = useApi(`/listings/?material=${material}&area=${area}`);

  // Pages added with "Load more", after the first page.
  const [morePages, setMorePages] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(null);

  function changeFilter(setter, value) {
    setter(value);
    setMorePages([]); // new filter: start again from page 1
    setMoreError(null);
  }

  const pages = firstPage.data ? [firstPage.data, ...morePages] : [];
  const listings = pages.flatMap((page) => page.results);
  const next = pages.length > 0 ? pages[pages.length - 1].next : null;

  async function loadMore() {
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await api(next); // next is the full address of the next page
      setMorePages([...morePages, page]);
    } catch (error) {
      setMoreError(error);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      {/* Only for visitors who aren't logged in (and not while we're still checking). */}
      {!checkingLogin && !business && (
        <section className="welcome">
          <p className="welcome-line">One business's waste is another business's raw material.</p>
          <Link className="button primary" to="/sign-up">Sign up</Link>
        </section>
      )}
      <h1>Leftovers near you</h1>
      <p className="lead">Live listings from Nairobi businesses. Ask for what you need and collect it.</p>

      <div className="filters">
        <div>
          <label htmlFor="material-filter">Material</label>
          <select
            id="material-filter"
            value={material}
            onChange={(e) => changeFilter(setMaterial, e.target.value)}
            disabled={loadingMore}
          >
            <option value="">All materials</option>
            {(materials.data || []).map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="area-filter">Area</label>
          <select
            id="area-filter"
            value={area}
            onChange={(e) => changeFilter(setArea, e.target.value)}
            disabled={loadingMore}
          >
            <option value="">All areas</option>
            {(areas.data || []).map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {firstPage.loading ? (
        <p className="loading">{LOADING_TEXT}</p>
      ) : firstPage.error ? (
        <>
          <ErrorList messages={errorMessages(firstPage.error)} />
          <button type="button" className="button ghost" onClick={firstPage.reload}>Try again</button>
        </>
      ) : listings.length === 0 ? (
        <p className="empty">No live listings match. Try another material or area.</p>
      ) : (
        <>
          <p className="meta">
            {firstPage.data.count} live {firstPage.data.count === 1 ? 'listing' : 'listings'}
          </p>
          <div className="card-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing}>
                {/* No point asking for your own leftovers. */}
                {listing.seller.id !== business?.id && (
                  <Link className="button ghost" to={`/needs/new?material=${listing.material.id}`}>
                    Need this? Post a need
                  </Link>
                )}
              </ListingCard>
            ))}
          </div>
          {next && (
            <div className="load-more">
              <ErrorList messages={moreError && errorMessages(moreError)} />
              <button type="button" className="button ghost" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
