import { useState, useCallback } from "react";
import * as commerceService from "../services/commerceService";

/**
 * Hook pour la gestion des commerces.
 */
export function useCommerceStore() {
  const [commerces, setCommerces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c, cat, t] = await Promise.all([
        commerceService.fetchCommerces(),
        commerceService.fetchCategories(),
        commerceService.fetchTypes(),
      ]);
      setCommerces(c);
      setCategories(cat);
      setTypes(t);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCommerce = useCallback((id) => {
    setCommerces((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    commerces,
    categories,
    types,
    loading,
    loadAll,
    setCommerces,
    removeCommerce,
  };
}
