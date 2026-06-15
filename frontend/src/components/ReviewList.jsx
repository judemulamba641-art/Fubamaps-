/**
 * Liste des avis de l'utilisateur connecté - FubaMaps.
 */

import { useCallback, useEffect, useState } from "react";
import { fetchMyReviews, deleteReview } from "../services/reviewService";
import { useToast } from "./useToast";
import { useUI } from "../store/uiStore";

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { openModal } = useUI();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyReviews();
      setReviews(data);
    } catch {
      addToast("Erreur chargement avis", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      addToast("Avis supprimé", "success");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  if (loading) return <p style={statusText}>Chargement de vos avis...</p>;
  if (reviews.length === 0) return <p style={statusText}>Vous n'avez pas encore laissé d'avis.</p>;

  return (
    <div style={container}>
      <h2 style={title}>Mes Avis</h2>
      {reviews.map((r) => (
        <div key={r.id} style={card}>
          <div style={cardHeader}>
            <span style={commerceName}>{r.commerce?.name || "Commerce"}</span>
            <span style={starsStyle}>{stars(r.note)}</span>
          </div>
          {r.commentaire && <p style={comment}>{r.commentaire}</p>}
          <div style={actions}>
            {r.commerce && (
              <button
                style={actionBtn}
                onClick={() => openModal("review", r.commerce)}
              >
                Voir avis commerce
              </button>
            )}
            <button
              style={{ ...actionBtn, color: "#ef4444" }}
              onClick={() => handleDelete(r.id)}
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const container = { padding: "0 0 20px" };
const title = { fontSize: 18, fontWeight: 700, margin: "0 0 16px" };
const statusText = { color: "var(--text-muted, #888)", fontSize: 14, textAlign: "center", padding: 40 };

const card = {
  padding: 14,
  borderRadius: 10,
  border: "1px solid var(--border, #e5e7eb)",
  marginBottom: 10,
  background: "var(--bg-card, #fff)",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 6,
};

const commerceName = { fontWeight: 700, fontSize: 14 };
const starsStyle = { color: "#f59e0b", fontSize: 14 };
const comment = { fontSize: 13, color: "var(--text-muted, #666)", margin: "4px 0 8px", lineHeight: 1.4 };

const actions = { display: "flex", gap: 8 };

const actionBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--accent, #2563eb)",
  padding: 0,
};
