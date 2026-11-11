import { CONDITIONS, formatDate, formatKg, formatPrice, formatQuantity } from '../helpers.js';

// One listing as a card. Anything put inside <ListingCard>...</ListingCard> (like buttons) goes at the bottom.
export default function ListingCard({ listing, children }) {
  return (
    <article className="card listing-card">
      <p className="meta seller-label">{listing.material.name}</p>
      <p className="big-number">
        {formatKg(listing.kg_left)} <span className="muted">left</span>
      </p>
      <dl className="facts">
        <dt>Quantity</dt>
        <dd>{formatQuantity(listing)}</dd>
        <dt>Condition</dt>
        <dd>{CONDITIONS[listing.condition] || listing.condition}</dd>
        <dt>Price</dt>
        <dd>{formatPrice(listing.price_per_unit, listing.unit)}</dd>
        <dt>Until</dt>
        <dd>{formatDate(listing.available_until)}</dd>
      </dl>
      {listing.description && <p className="description">{listing.description}</p>}
      <p className="meta">
        {listing.seller.name} · {listing.seller.area.name}
      </p>
      {children && <div className="actions">{children}</div>}
    </article>
  );
}
