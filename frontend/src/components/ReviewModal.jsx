/**
 * Modal Avis FubaMaps.
 * Gere la liste, creation, modification et suppression d'avis pour un commerce.
 */

import { useState, useEffect } from "react";
import { useReview } from "../store/reviewStore";
import { useUI } from "../store/uiStore";
import { useAuth } from "../store/authStore";

export default function ReviewModal() {
  const { reviews, loading, loadForCommerce, create, update, remove, react } = useReview();
  const { modalData, closeModal } = useUI();
  const { user } = useAuth();

  const [view, setView] = useState("list"); // list, create, edit
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [note, setNote] = useState(5);
  const [priceRating, setPriceRating] = useState(3);
  const [commentaire, setCommentaire] = useState("");
  const [userName, setUserName] = useState("");

  const commerceId = modalData?.id;
  const commerceName = modalData?.name || "Commerce";

  useEffect(() => {
    if (commerceId) {
      loadForCommerce(commerceId);
    }
  }, [commerceId, loadForCommerce]);

  useEffect(() => {
    if (user) {
      setUserName(user.first_name || user.email);
    }
  }, [user]);

  const resetForm = () => {
    setNote(5);
    setPriceRating(3);
    setCommentaire("");
    setError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await create({
        commerce: commerceId,
        note,
        price_rating: priceRating,
        commentaire,
        user_name: userName,
      });
      resetForm();
      setView("list");
      loadForCommerce(commerceId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await update(editingReview.id, {
        note,
        price_rating: priceRating,
        commentaire,
      });
      resetForm();
      setView("list");
      setEditingReview(null);
      loadForCommerce(commerceId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await remove(id);
      loadForCommerce(commerceId);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setNote(review.note);
    setPriceRating(review.price_rating);
    setCommentaire(review.commentaire);
    setView("edit");
  };

  const handleReact = async (id, action) => {
    try {
      await react(id, action);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Avis - {commerceName}</h2>
          <button className="btn-close" onClick={closeModal}>&times;</button>
        </div>

        <div className="review-tabs">
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => { setView("list"); resetForm(); }}
          >
            Liste
          </button>
          <button
            className={view === "create" ? "active" : ""}
            onClick={() => { setView("create"); resetForm(); setEditingReview(null); }}
          >
            Ajouter
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-body">
          {/* Liste des avis */}
          {view === "list" && (
            <div className="review-list">
              {loading && <p className="loading-text">Chargement...</p>}
              {!loading && reviews.length === 0 && (
                <p className="empty-text">Aucun avis pour ce commerce.</p>
              )}
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-stars">{renderStars(review.note)}</span>
                    <span className="review-user">{review.user_name || "Anonyme"}</span>
                  </div>
                  <p className="review-comment">{review.commentaire || "Pas de commentaire"}</p>
                  <div className="review-meta">
                    <span className="review-price">Prix: {review.price_label || review.price_rating}/5</span>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="review-actions">
                    <button className="btn-icon" onClick={() => handleReact(review.id, "like")}>
                      👍 {review.likes}
                    </button>
                    <button className="btn-icon" onClick={() => handleReact(review.id, "dislike")}>
                      👎 {review.dislikes}
                    </button>
                    <button className="btn-icon btn-edit" onClick={() => startEdit(review)}>
                      Modifier
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(review.id)}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire creation/edition */}
          {(view === "create" || view === "edit") && (
            <form onSubmit={view === "create" ? handleCreate : handleEdit} className="review-form">
              <div className="form-group">
                <label>Note *</label>
                <div className="star-selector">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`star-btn ${n <= note ? "active" : ""}`}
                      onClick={() => setNote(n)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Rapport qualite/prix</label>
                <select value={priceRating} onChange={(e) => setPriceRating(Number(e.target.value))}>
                  <option value={1}>Tres cher</option>
                  <option value={2}>Cher</option>
                  <option value={3}>Normal</option>
                  <option value={4}>Bon marche</option>
                  <option value={5}>Tres bon marche</option>
                </select>
              </div>

              <div className="form-group">
                <label>Commentaire</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Votre avis sur ce commerce..."
                  rows={4}
                />
              </div>

              {view === "create" && (
                <div className="form-group">
                  <label>Votre nom</label>
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nom affiche"
                  />
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setView("list")}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "..." : view === "create" ? "Publier" : "Modifier"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
