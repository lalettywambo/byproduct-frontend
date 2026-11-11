import { formatKg, postAction } from '../helpers.js';
import ActionButton from './ActionButton.jsx';
import StatusPill from './StatusPill.jsx';

// One pickup request, with the buttons the viewer is allowed to press.
//   viewerId - the logged-in business's id, to know if we're the buyer or the seller
//   onDone   - called with the API's message after a button worked
export default function PickupRow({ pickup, viewerId, onDone }) {
  const isBuyer = pickup.buyer.id === viewerId;
  const other = isBuyer ? pickup.seller : pickup.buyer;
  const url = `/pickups/${pickup.id}`;

  return (
    <article className={`card pickup-row ${isBuyer ? 'buyer' : 'seller'}`}>
      <div className="row-head">
        <p className="big-number">
          {formatKg(pickup.kg)} <span className="muted">{pickup.listing.material.name}</span>
        </p>
        <StatusPill pickup={pickup} />
      </div>
      <p className="row-text">
        {isBuyer ? 'From' : 'For'} <strong>{other.name}</strong> · {other.area.name}
      </p>
      {/* The API only sends the phone once the seller has agreed. */}
      {pickup.other_phone && (
        <p className="row-text">
          Phone: <a href={`tel:${pickup.other_phone}`}>{pickup.other_phone}</a>
        </p>
      )}
      <p className="meta">{isBuyer ? 'You are buying' : 'You are selling'}</p>

      <div className="actions">
        {pickup.status === 'pending' && !isBuyer && (
          <>
            <ActionButton className="seller" run={() => postAction(`${url}/accept/`)} onDone={onDone}>
              Accept
            </ActionButton>
            <ActionButton className="warn" run={() => postAction(`${url}/decline/`)} onDone={onDone}>
              Decline
            </ActionButton>
          </>
        )}
        {pickup.status === 'pending' && isBuyer && (
          <ActionButton className="warn" run={() => postAction(`${url}/cancel/`)} onDone={onDone}>
            Cancel request
          </ActionButton>
        )}
        {pickup.status === 'accepted' && isBuyer && (
          <ActionButton className="primary" run={() => postAction(`${url}/collect/`)} onDone={onDone}>
            Mark collected
          </ActionButton>
        )}
        {pickup.status === 'accepted' && (
          <ActionButton
            className="warn"
            run={() => postAction(`${url}/cancel/`)}
            onDone={onDone}
            confirmText={`Cancel the agreed pickup with ${other.name}?`}
          >
            Cancel pickup
          </ActionButton>
        )}
      </div>
    </article>
  );
}
