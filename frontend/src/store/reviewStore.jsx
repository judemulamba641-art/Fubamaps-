/**
 * Store des avis FubaMaps.
 * Gere l'etat des avis (React Context).
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useCallback } from "react";
import {
  fetchAllReviews,
  fetchCommerceReviews,
  createReview as createApi,
  updateReview as updateApi,
  deleteReview as deleteApi,
  reactToReview,
} from "../services/reviewService";

const ReviewContext = createContext(null);

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllReviews();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadForCommerce = useCallback(async (commerceId, filters) => {
    setLoading(true);
    try {
      const data = await fetchCommerceReviews(commerceId, filters);
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data) => {
    const review = await createApi(data);
    setReviews((prev) => [review, ...prev]);
    return review;
  };

  const update = async (id, data) => {
    const review = await updateApi(id, data);
    setReviews((prev) => prev.map((r) => (r.id === id ? review : r)));
    return review;
  };

  const remove = async (id) => {
    await deleteApi(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const react = async (id, action) => {
    await reactToReview(id, action);
    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            likes: action === "like" ? r.likes + 1 : r.likes,
            dislikes: action === "dislike" ? r.dislikes + 1 : r.dislikes,
          };
        }
        return r;
      })
    );
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        loading,
        error,
        loadAll,
        loadForCommerce,
        create,
        update,
        remove,
        react,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReview must be inside ReviewProvider");
  return ctx;
}
