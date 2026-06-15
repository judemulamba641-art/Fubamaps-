/**
 * Store UI FubaMaps.
 * Gere l'etat de l'interface (modales, vue active, theme).
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useCallback } from "react";

const UIContext = createContext(null);

// Vues possibles pour la zone centrale
export const VIEWS = {
  COMMERCE_LIST: "commerce_list",
  COMMERCE_DETAIL: "commerce_detail",
  SEARCH_RESULTS: "search_results",
  REVIEWS: "reviews",
  PROFILE: "profile",
};

// Modales possibles
export const MODALS = {
  NONE: null,
  LOGIN: "login",
  SETTINGS: "settings",
  CREATE_COMMERCE: "create_commerce",
  EDIT_COMMERCE: "edit_commerce",
  VIEW_COMMERCE: "view_commerce",
  DELETE_COMMERCE: "delete_commerce",
  REVIEW: "review",
  PROFILE: "profile",
};

export function UIProvider({ children }) {
  const [currentView, setCurrentView] = useState(VIEWS.COMMERCE_LIST);
  const [activeModal, setActiveModal] = useState(MODALS.NONE);
  const [modalData, setModalData] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("fubamaps_theme") || "light"
  );
  const [commandHistory, setCommandHistory] = useState([]);

  const openModal = useCallback((modal, data = null) => {
    setActiveModal(modal);
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(MODALS.NONE);
    setModalData(null);
  }, []);

  const switchView = useCallback((view, data = null) => {
    setCurrentView(view);
    if (data) setModalData(data);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("fubamaps_theme", next);
      return next;
    });
  }, []);

  const addToHistory = useCallback((command) => {
    setCommandHistory((prev) => [...prev.slice(-49), command]);
  }, []);

  return (
    <UIContext.Provider
      value={{
        currentView,
        activeModal,
        modalData,
        theme,
        commandHistory,
        openModal,
        closeModal,
        switchView,
        toggleTheme,
        addToHistory,
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
