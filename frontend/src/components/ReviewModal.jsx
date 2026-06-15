/**
 * Modal Avis (Reviews) - FubaMaps.
 * CRUD complet des avis pour un commerce.
 */

import { useCallback, useEffect, useState } from "react";
import { useToast } from "./useToast";
import {
  fetchCommerceReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../services/reviewService";

export default function ReviewModal({ commerce, onClose }) {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [editingReview, setEditingReview] = useState(null);

  const [form, setForm] = useState({
    note: 5,
    price_rating: 3,
    commentaire: "",
    user_name: "",
  });

  const loadReviews = useCallback(async () => {
    if (!commerce) return;
    setLoading(true);
    try {
      const data = await fetchCommerceReviews(commerce.id);
      setReviews(data);
    } catch {
      addToast("Erreur chargement avis", "error");
    } finally {
      setLoading(false);
    }
  }, [commerce, addToast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReview({
        commerce: commerce.id,
        note: parseInt(form.note, 10),
        price_rating: parseInt(form.price_rating, 10),
        commentaire: form.commentaire,
        user_name: form.user_name,
      });
      addToast("Avis ajouté", "success");
      setForm({ note: 5, price_rating: 3, commentaire: "", user_name: "" });
      setView("list");
      await loadReviews();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    setLoading(true);
    try {
      await updateReview(editingReview.id, {
        note: parseInt(form.note, 10),
        price_rating: parseInt(form.price_rating, 10),
        commentaire: form.commentaire,
      });
      addToast("Avis modifié", "success");
      setEditingReview(null);
      setView("list");
      await loadReviews();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteReview(id);
      addToast("Avis supprimé", "success");
      await loadReviews();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setForm({
      note: review.note,
      price_rating: review.price_rating,
      commentaire: review.commentaire,
      user_name: review.user_name || "",
    });
    setView("edit");
  };

  const startCreate = () => {
    setEditingReview(null);
    setForm({ note: 5, price_rating: 3, commentaire: "", user_name: "" });
    setView("create");
  };

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h2 style={titleStyle}>
            Avis - {commerce?.name}
          </h2>
          <button style={closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div style={tabBar}>
          <button
            style={view === "list" ? tabActive : tabBtn}
            onClick={() => setView("list")}
          >
            Liste ({reviews.length})
          </button>
          <button
            style={view === "create" ? tabActive : tabBtn}
            onClick={startCreate}
          >
            Ajouter
          </button>
        </div>

        <div style={body}>
          {view === "list" && (
            <div>
              {loading && <p style={mutedText}>Chargement...</p>}
              {!loading && reviews.length === 0 && (
                <p style={mutedText}>Aucun avis pour ce commerce.</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} style={reviewCard}>
                  <div style={reviewHeader}>
                    <span style={starsStyle}>{stars(r.note)}</span>
                    <span style={reviewDate}>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString("fr-FR")
                        : ""}
                    </span>
                  </div>
                  {r.commentaire && <p style={commentText}>{r.commentaire}</p>}
                  {r.user_name && (
                    <span style={userName}>— {r.user_name}</span>
                  )}
                  <div style={reviewActions}>
                    <button style={smallBtn} onClick={() => startEdit(r)}>
                      Modifier
                    </button>
                    <button
                      style={{ ...smallBtn, color: "#ef4444" }}
                      onClick={() => handleDelete(r.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(view === "create" || view === "edit") && (
            <form
              onSubmit={view === "edit" ? handleUpdate : handleCreate}
              style={formStyle}
            >
              <label style={labelStyle}>
                Note
                <select
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  style={input}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {stars(n)} ({n}/5)
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Rapport qualité/prix
                <select
                  value={form.price_rating}
                  onChange={(e) =>
                    setForm({ ...form, price_rating: e.target.value })
                  }
                  style={input}
                >
                  <option value={1}>Très cher</option>
                  <option value={2}>Cher</option>
                  <option value={3}>Normal</option>
                  <option value={4}>Bon marché</option>
                  <option value={5}>Très bon marché</option>
                </select>
              </label>

              <label style={labelStyle}>
                Commentaire
                <textarea
                  value={form.commentaire}
                  onChange={(e) =>
                    setForm({ ...form, commentaire: e.target.value })
                  }
                  style={{ ...input, minHeight: 80, resize: "vertical" }}
                  placeholder="Votre avis..."
                />
              </label>

              {view === "create" && (
                <label style={labelStyle}>
                  Votre nom (optionnel)
                  <input
                    value={form.user_name}
                    onChange={(e) =>
                      setForm({ ...form, user_name: e.target.value })
                    }
                    style={input}
                    placeholder="Nom"
                  />
                </label>
              )}

              <button type="submit" style={submitBtn} disabled={loading}>
                {loading
                  ? "..."
                  : view === "edit"
                    ? "Sauvegarder"
                    : "Publier l'avis"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(3px)",
};

const modal = {
  background: "var(--bg-card, #fff)",
  color: "var(--text, #222)",
  borderRadius: 16,
  width: "min(520px, 94vw)",
  maxHeight: "85vh",
  overflow: "hidden",
  boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 24px",
  borderBottom: "1px solid var(--border, #eee)",
};

const titleStyle = { margin: 0, fontSize: 18, fontWeight: 700 };

const closeBtn = {
  background: "none",
  border: "none",
  fontSize: 24,
  cursor: "pointer",
  color: "var(--text-muted, #666)",
};

const tabBar = {
  display: "flex",
  borderBottom: "1px solid var(--border, #eee)",
};

const tabBtn = {
  flex: 1,
  padding: "10px 0",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 14,
  color: "var(--text-muted, #666)",
  fontWeight: 500,
};

const tabActive = {
  ...tabBtn,
  color: "var(--accent, #2563eb)",
  fontWeight: 700,
  borderBottom: "2px solid var(--accent, #2563eb)",
};

const body = { padding: 20, overflowY: "auto", flex: 1 };

const reviewCard = {
  padding: 14,
  borderRadius: 10,
  border: "1px solid var(--border, #eee)",
  marginBottom: 10,
};

const reviewHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 6,
};

const starsStyle = { color: "#f59e0b", fontSize: 16 };
const reviewDate = { fontSize: 12, color: "var(--text-muted, #999)" };
const commentText = { fontSize: 14, margin: "6px 0", lineHeight: 1.4 };
const userName = { fontSize: 12, color: "var(--text-muted, #888)" };
const mutedText = { color: "var(--text-muted, #888)", fontSize: 14, textAlign: "center" };

const reviewActions = {
  display: "flex",
  gap: 8,
  marginTop: 8,
};

const smallBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 12,
  color: "var(--accent, #2563eb)",
  fontWeight: 600,
  padding: 0,
};

const formStyle = { display: "flex", flexDirection: "column", gap: 14 };

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-muted, #555)",
};

const input = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border, #ddd)",
  fontSize: 14,
  background: "var(--bg-input, #f9f9f9)",
  color: "var(--text, #222)",
  outline: "none",
  boxSizing: "border-box",
};

const submitBtn = {
  padding: "12px 0",
  borderRadius: 8,
  border: "none",
  background: "var(--accent, #2563eb)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 4,
};
