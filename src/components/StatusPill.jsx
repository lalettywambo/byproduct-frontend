// The colour for each pickup status. The text comes from the API's status_label.
const COLOURS = {
  pending: 'amber',
  accepted: 'teal',
  collected: 'green',
  declined: 'red',
  cancelled: 'red',
};

export default function StatusPill({ pickup }) {
  return <span className={`pill ${COLOURS[pickup.status]}`}>{pickup.status_label}</span>;
}
