import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../AuthContext.jsx';
import { LOADING_TEXT } from '../helpers.js';

// Wrap a page that needs a login. Logged-out visitors go to /login, which sends them
// back here afterwards (we pass the address they wanted in the navigation "state").
export default function RequireAuth({ children }) {
  const { business, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="loading">{LOADING_TEXT}</p>;
  if (!business) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
