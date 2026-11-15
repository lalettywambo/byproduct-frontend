import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Impact from './pages/Impact.jsx';
import Profile from './pages/Profile.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ListingForm from './pages/ListingForm.jsx';
import NeedForm from './pages/NeedForm.jsx';
import NeedPage from './pages/NeedPage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* The link in the reset email opens this page. */}
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/listings/new" element={<RequireAuth><ListingForm /></RequireAuth>} />
        <Route path="/listings/:id/edit" element={<RequireAuth><ListingForm /></RequireAuth>} />
        <Route path="/needs/new" element={<RequireAuth><NeedForm /></RequireAuth>} />
        <Route path="/needs/:id" element={<RequireAuth><NeedPage /></RequireAuth>} />
        <Route path="/needs/:id/edit" element={<RequireAuth><NeedForm /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
