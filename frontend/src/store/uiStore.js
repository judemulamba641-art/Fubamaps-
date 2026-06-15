import { useState, useCallback, useEffect } from "react";

/**
 * Hook pour la gestion de l'interface (modals, theme, etc.).
 */
export function useUIStore() {
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("fubamaps_theme") || "light"
  );
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("fubamaps_theme", theme);
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

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: Date.now(), ...msg }]);
  }, []);

  return {
    activeModal,
    modalData,
    theme,
    messages,
    openModal,
    closeModal,
    setTheme,
    toggleTheme,
    addMessage,
  };
}
