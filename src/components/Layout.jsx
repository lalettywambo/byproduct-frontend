import { Link, NavLink, Outlet } from 'react-router';
import { useAuth } from '../AuthContext.jsx';

// The header and nav on every page. <Outlet /> is where the current page appears.
export default function Layout() {
  const { business, loading } = useAuth();

  return (
    <>
      <header className="site-header">
        <div className="container header-row">
          <Link to="/" className="brand">ByProduct</Link>
          <nav aria-label="Main">
            <NavLink to="/" end>Browse</NavLink>
            <NavLink to="/impact">Impact</NavLink>
            {/* While a saved login is being checked, show neither set of links. */}
            {loading ? null : business ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/profile">Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login">Log in</NavLink>
                <NavLink to="/sign-up">Sign up</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
