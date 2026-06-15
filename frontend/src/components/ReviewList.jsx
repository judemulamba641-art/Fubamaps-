/**
 * Liste des avis FubaMaps (vue globale).
 * Affiche tous les avis recents.
 */

import { useEffect } from "react";
import { useReview } from "../store/reviewStore";

export default function ReviewList() {
  const { reviews, loading, loadAll } = useReview();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="review-list-container">
      <h2>Avis recents</h2>

      {loading ? (
        <div className="loading-state">Chargement des avis...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <p>Aucun avis pour le moment.</p>
        </div>
      ) : (
        <div className="review-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="review-stars">{renderStars(review.note)}</span>
                <span className="review-user">{review.user_name || "Anonyme"}</span>
              </div>
              {review.commerce && (
                <p className="review-commerce">{review.commerce.name}</p>
              )}
              <p className="review-comment">{review.commentaire || "Pas de commentaire"}</p>
              <div className="review-meta">
                <span>👍 {review.likes} | 👎 {review.dislikes}</span>
                <span>{new Date(review.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
