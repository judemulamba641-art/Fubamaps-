/**
 * Store commerces - React Context.
 */

import { createContext, useCallback, useContext, useState } from "react";
import * as svc from "../services/commerceService";

const CommerceContext = createContext(null);

export function CommerceProvider({ children }) {
  const [commerces, setCommerces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c, cat, t] = await Promise.all([
        svc.fetchCommerces(),
        svc.fetchCategories(),
        svc.fetchTypes(),
      ]);
      setCommerces(c);
      setCategories(cat);
      setTypes(t);
    } catch (err) {
      console.error("Erreur chargement commerces:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCommerce = (commerce) => {
    setCommerces((prev) => [commerce, ...prev]);
  };

  const removeCommerce = (id) => {
    setCommerces((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCommerceInList = (updated) => {
    setCommerces((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  return (
    <CommerceContext.Provider
      value={{
        commerces,
        categories,
        types,
        loading,
        loadAll,
        addCommerce,
        removeCommerce,
        updateCommerceInList,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerces() {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error("useCommerces must be inside CommerceProvider");
  return ctx;
}
