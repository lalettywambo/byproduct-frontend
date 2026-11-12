import { errorMessages } from '../api.js';
import ErrorList from '../components/ErrorList.jsx';
import { formatKg, LOADING_TEXT } from '../helpers.js';
import { useApi } from '../useApi.js';

// Public page: how many kilos have been reused so far, and of which materials.
export default function Impact() {
  const impact = useApi('/impact/');

  return (
    <>
      <h1>Impact</h1>
      <p className="lead">Only collected kilos count: leftovers that were really picked up and reused.</p>

      {impact.error ? (
        <>
          <ErrorList messages={errorMessages(impact.error)} />
          <button type="button" className="button ghost" onClick={impact.reload}>Try again</button>
        </>
      ) : !impact.data ? (
        <p className="loading">{LOADING_TEXT}</p>
      ) : (
        <>
          <div className="card impact-total">
            <p className="impact-number">{formatKg(impact.data.total_kg)}</p>
            <p className="meta">
              reused from {impact.data.pickups} completed {impact.data.pickups === 1 ? 'pickup' : 'pickups'}
            </p>
          </div>

          <h2>By material</h2>
          {impact.data.by_material.length === 0 ? (
            <p className="empty">Nothing has been collected yet. The first pickup will show here.</p>
          ) : (
            <ul className="card impact-bars">
              {impact.data.by_material.map((row) => (
                <li key={row.material}>
                  <div className="impact-row">
                    <span>{row.material}</span>
                    <span className="meta">{formatKg(row.kg)}</span>
                  </div>
                  {/* bar_percent comes from the API: the biggest material is 100. */}
                  <div className="impact-bar" aria-hidden="true">
                    <span style={{ width: `${Math.max(row.bar_percent, 1)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
