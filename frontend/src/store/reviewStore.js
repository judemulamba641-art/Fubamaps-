import { useState, useCallback } from "react";
import * as reviewService from "../services/reviewService";

/**
 * Hook pour la gestion des avis.
 */
export function useReviewStore() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReviews = useCallback(async (commerceId) => {
    setLoading(true);
    try {
      const data = await reviewService.fetchReviewsByCommerce(commerceId);
      setReviews(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (commerceId) => {
    try {
      const data = await reviewService.fetchReviewStats(commerceId);
      setStats(data);
    } catch {
      setStats(null);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reviewService.fetchAllReviews();
      setReviews(data);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reviews,
    stats,
    loading,
    loadReviews,
    loadStats,
    loadAll,
    setReviews,
  };
}
