/**
 * Store d'authentification FubaMaps.
 * Gere l'etat de l'utilisateur connecte (React Context).
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  fetchMe,
  isAuthenticated,
  getStoredUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    async function init() {
      if (isAuthenticated()) {
        try {
          const me = await fetchMe();
          setUser(me);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    init();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await loginApi(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (firstName, lastName, email, password, passwordConfirm) => {
    setError(null);
    try {
      const data = await registerApi(firstName, lastName, email, password, passwordConfirm);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await fetchMe();
    setUser(me);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        isLoggedIn: !!user,
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
