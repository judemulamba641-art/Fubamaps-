/**
 * Store des commerces FubaMaps.
 * Gere l'etat des commerces, categories et types (React Context).
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useCallback } from "react";
import {
  fetchCommerces,
  fetchCategories,
  fetchTypes,
  createCommerce as createApi,
  updateCommerce as updateApi,
  deleteCommerce as deleteApi,
} from "../services/commerceService";

const CommerceContext = createContext(null);

export function CommerceProvider({ children }) {
  const [commerces, setCommerces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, cat, t] = await Promise.all([
        fetchCommerces(),
        fetchCategories(),
        fetchTypes(),
      ]);
      setCommerces(c);
      setCategories(cat);
      setTypes(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCommerces = useCallback(async (params) => {
    setLoading(true);
    try {
      const c = await fetchCommerces(params);
      setCommerces(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data) => {
    const commerce = await createApi(data);
    setCommerces((prev) => [commerce, ...prev]);
    return commerce;
  };

  const update = async (id, data) => {
    const commerce = await updateApi(id, data);
    setCommerces((prev) => prev.map((c) => (c.id === id ? commerce : c)));
    return commerce;
  };

  const remove = async (id) => {
    await deleteApi(id);
    setCommerces((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CommerceContext.Provider
      value={{
        commerces,
        categories,
        types,
        loading,
        error,
        loadAll,
        loadCommerces,
        create,
        update,
        remove,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error("useCommerce must be inside CommerceProvider");
  return ctx;
}
