import { formatKg } from '../helpers.js';

// A need's progress as one stacked bar: collected (green), agreed (teal), waiting (amber).
// The rest of the bar is what nobody has been asked for yet. The key underneath gives the kilos.
export default function ProgressBar({ need }) {
  const { collected, agreed, waiting, still_needed } = need.progress;
  const width = (kg) => `${Math.min(100, (kg / need.kg) * 100)}%`;

  return (
    <div className="progress">
      {/* The bar is only a picture: screen readers read the key below instead. */}
      <div className="progress-bar" aria-hidden="true">
        <span className="collected" style={{ width: width(collected) }} />
        <span className="agreed" style={{ width: width(agreed) }} />
        <span className="waiting" style={{ width: width(waiting) }} />
      </div>
      <ul className="progress-key">
        <li><span className="dot collected" />Collected {formatKg(collected)}</li>
        <li><span className="dot agreed" />Agreed {formatKg(agreed)}</li>
        <li><span className="dot waiting" />Waiting {formatKg(waiting)}</li>
        <li><span className="dot" />Not asked yet {formatKg(still_needed)}</li>
      </ul>
    </div>
  );
}
