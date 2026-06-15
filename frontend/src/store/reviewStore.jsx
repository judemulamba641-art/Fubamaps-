/**
 * Store avis (reviews) - React Context.
 */

import { createContext, useCallback, useContext, useState } from "react";
import * as svc from "../services/reviewService";

const ReviewContext = createContext(null);

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCommerceReviews = useCallback(async (commerceId) => {
    setLoading(true);
    try {
      const data = await svc.fetchCommerceReviews(commerceId);
      setReviews(data);
    } catch (err) {
      console.error("Erreur chargement avis:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await svc.fetchMyReviews();
      setMyReviews(data);
    } catch (err) {
      console.error("Erreur chargement mes avis:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        myReviews,
        loading,
        loadCommerceReviews,
        loadMyReviews,
        setReviews,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReviews must be inside ReviewProvider");
  return ctx;
}
