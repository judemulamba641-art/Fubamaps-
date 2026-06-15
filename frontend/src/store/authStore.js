import { useState, useCallback, useEffect } from "react";
import * as authService from "../services/authService";

/**
 * Hook global pour la gestion de l'authentification.
 */
export function useAuthStore() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      setAuthenticated(false);
      return;
    }

    try {
      const me = await authService.getMe();
      setUser(me);
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    const handleLogout = () => {
      setUser(null);
      setAuthenticated(false);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [loadUser]);

  const doLogin = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    const me = await authService.getMe();
    setUser(me);
    setAuthenticated(true);
    return data;
  }, []);

  const doRegister = useCallback(async (payload) => {
    const data = await authService.register(payload);
    // Auto-login after registration
    await authService.login(payload.email, payload.password);
    const me = await authService.getMe();
    setUser(me);
    setAuthenticated(true);
    return data;
  }, []);

  const doLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch {
      // ignore
    }
  }, []);

  return {
    user,
    loading,
    authenticated,
    doLogin,
    doRegister,
    doLogout,
    refreshUser,
  };
}
