// Who is logged in, shared with every page. Use it with: const { business, login } = useAuth();
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api, ApiError, clearTokens, getRefreshToken, hasRefreshToken, saveTokens } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null); // null = logged out
  // Only wait for /me/ when there is a saved login to check.
  const [loading, setLoading] = useState(hasRefreshToken);

  // On first load: a refresh token in localStorage means someone logged in before.
  // api() uses it to get an access token, then /me/ tells us which business it is.
  useEffect(() => {
    if (!hasRefreshToken()) return;
    api('/me/')
      .then((data) => setBusiness(data.business))
      .catch((error) => {
        // 401 = the saved login has run out. Offline or a sleeping server: keep it for next time.
        if (error instanceof ApiError && error.status === 401) clearTokens();
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await api('/auth/login/', { method: 'POST', body: { username, password } });
    saveTokens(data);
    setBusiness(data.business);
  }

  async function register(form) {
    const data = await api('/auth/register/', { method: 'POST', body: form });
    saveTokens(data);
    setBusiness(data.business);
  }

  // Forget the login on this device and go to the home page.
  function signOut() {
    clearTokens();
    setBusiness(null);
    navigate('/');
  }

  async function logout() {
    try {
      // Tells the server this refresh token can't be used again.
      await api('/auth/logout/', { method: 'POST', body: { refresh: getRefreshToken() } });
    } catch {
      // Log out on this device even if the server didn't answer.
    }
    signOut();
  }

  async function deleteAccount() {
    await api('/me/', { method: 'DELETE' }); // an error goes back to the Profile page to show
    signOut();
  }

  const value = { business, setBusiness, loading, login, register, logout, deleteAccount };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// This file also exports a hook, so editing it reloads the whole page in dev instead of hot-swapping.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
