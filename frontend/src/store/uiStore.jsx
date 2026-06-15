/**
 * Store UI - React Context.
 * Gère les modales, thème, et état d'interface global.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const UIContext = createContext(null);

const THEME_KEY = "fubamaps_theme";

export function UIProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(THEME_KEY) || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const openModal = useCallback((name, data = null) => {
    setActiveModal(name);
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return (
    <UIContext.Provider
      value={{
        activeModal,
        modalData,
        theme,
        openModal,
        closeModal,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be inside UIProvider");
  return ctx;
}
