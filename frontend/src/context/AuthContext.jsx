import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { AUTH_EXPIRED_EVENT, clearTokens, getRefreshToken, setTokens } from "../api/client";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    try { const data = await authApi.me(); setUser(data); }
    catch (err) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) { clearTokens(); setUser(null); return; }
      try { const refreshed = await authApi.refresh(refreshToken); setTokens(refreshed.tokens); setUser(await authApi.me()); }
      catch { clearTokens(); setUser(null); }
    }
  }, []);

  useEffect(() => { loadUser().finally(() => setLoading(false)); }, [loadUser]);
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const signIn = async (email, password) => { setError(""); const data = await authApi.login(email, password); setTokens(data.tokens); setUser(data.user); return data; };
  const signUp = async (email, password, displayName) => { setError(""); const data = await authApi.register(email, password, displayName); setTokens(data.tokens); setUser(data.user); return data; };
  const signOut = () => { clearTokens(); setUser(null); };
  const value = useMemo(() => ({ user, loading, error, setError, signIn, signUp, signOut, refreshUser: loadUser }), [user, loading, error, loadUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
