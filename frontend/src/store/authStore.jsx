/**
 * Store d'authentification - React Context.
 * Gère l'état utilisateur, tokens JWT, auto-restauration session.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as auth from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    if (!auth.isAuthenticated()) {
      setLoading(false);
      return;
    }
    try {
      const me = await auth.fetchMe();
      setUser(me);
    } catch {
      auth.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const doLogin = async (email, password) => {
    const data = await auth.login(email, password);
    const me = await auth.fetchMe();
    setUser(me);
    return data;
  };

  const doRegister = async (payload) => {
    await auth.register(payload);
    return doLogin(payload.email, payload.password);
  };

  const doLogout = async () => {
    await auth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await auth.fetchMe();
      setUser(me);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login: doLogin,
        register: doRegister,
        logout: doLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
