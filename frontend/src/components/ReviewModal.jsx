import { useEffect, useState } from "react";
import * as reviewService from "../services/reviewService";

/**
 * Modal Avis complet.
 * - Liste des avis du commerce
 * - Ajouter un avis
 * - Modifier un avis
 * - Supprimer un avis
 */
export default function ReviewModal({ commerce, onClose, addToast }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); // list | create | edit
  const [editingReview, setEditingReview] = useState(null);
  const [form, setForm] = useState({ note: 5, price_rating: 3, commentaire: "", user_name: "" });
  const [submitting, setSubmitting] = useState(false);

  const commerceId = commerce?.id;

  const loadReviews = async () => {
    if (!commerceId) return;
    setLoading(true);
    try {
      const [revs, st] = await Promise.all([
        reviewService.fetchReviewsByCommerce(commerceId),
        reviewService.fetchReviewStats(commerceId),
      ]);
      setReviews(revs);
      setStats(st);
    } catch {
      addToast?.("Erreur chargement avis", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [commerceId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewService.createReview({
        commerce: commerceId,
        note: Number(form.note),
        price_rating: Number(form.price_rating),
        commentaire: form.commentaire,
        user_name: form.user_name,
      });
      addToast?.("Avis ajoute !", "success");
      setForm({ note: 5, price_rating: 3, commentaire: "", user_name: "" });
      setMode("list");
      loadReviews();
    } catch (err) {
      addToast?.(JSON.stringify(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    setSubmitting(true);
    try {
      await reviewService.updateReview(editingReview.id, {
        note: Number(form.note),
        price_rating: Number(form.price_rating),
        commentaire: form.commentaire,
      });
      addToast?.("Avis modifie !", "success");
      setMode("list");
      setEditingReview(null);
      loadReviews();
    } catch (err) {
      addToast?.(JSON.stringify(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet avis ?")) return;
    try {
      await reviewService.deleteReview(id);
      addToast?.("Avis supprime", "success");
      loadReviews();
    } catch {
      addToast?.("Erreur suppression", "error");
    }
  };

  const startEdit = (rev) => {
    setEditingReview(rev);
    setForm({
      note: rev.note,
      price_rating: rev.price_rating,
      commentaire: rev.commentaire,
      user_name: rev.user_name || "",
    });
    setMode("edit");
  };

  if (!commerce) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Avis - {commerce.name}</h2>
          <button onClick={onClose} style={closeBtn}>&times;</button>
        </div>

        {stats && (
          <div style={statsBar}>
            <span>Note moyenne: <b>{stats.average_rating}/5</b></span>
            <span>{stats.total_reviews} avis</span>
          </div>
        )}

        <div style={navBar}>
          <button style={mode === "list" ? navActive : navBtn} onClick={() => setMode("list")}>Liste</button>
          <button style={mode === "create" ? navActive : navBtn} onClick={() => { setMode("create"); setEditingReview(null); setForm({ note: 5, price_rating: 3, commentaire: "", user_name: "" }); }}>Ajouter</button>
        </div>

        <div style={content}>
          {loading ? (
            <p style={emptyText}>Chargement...</p>
          ) : mode === "list" ? (
            reviews.length === 0 ? (
              <p style={emptyText}>Aucun avis pour ce commerce.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} style={reviewCard}>
                  <div style={reviewHeader}>
                    <span style={reviewNote}>{rev.note}/5</span>
                    <span style={reviewUser}>{rev.user_name || "Anonyme"}</span>
                    <span style={reviewDate}>{rev.created_at ? new Date(rev.created_at).toLocaleDateString("fr-FR") : ""}</span>
                  </div>
                  {rev.commentaire && <p style={reviewComment}>{rev.commentaire}</p>}
                  <div style={reviewActions}>
                    <button style={smallBtn} onClick={() => startEdit(rev)}>Modifier</button>
                    <button style={smallBtnDanger} onClick={() => handleDelete(rev.id)}>Supprimer</button>
                  </div>
                </div>
              ))
            )
          ) : (
            <form onSubmit={mode === "edit" ? handleUpdate : handleCreate} style={formStyle}>
              <label style={labelStyle}>
                Note (1-5)
                <select value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} style={input}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                Rapport qualite/prix
                <select value={form.price_rating} onChange={(e) => setForm({...form, price_rating: e.target.value})} style={input}>
                  <option value="1">Tres cher</option>
                  <option value="2">Cher</option>
                  <option value="3">Normal</option>
                  <option value="4">Bon marche</option>
                  <option value="5">Tres bon marche</option>
                </select>
              </label>
              {mode === "create" && (
                <input placeholder="Votre nom (optionnel)" value={form.user_name} onChange={(e) => setForm({...form, user_name: e.target.value})} style={input} />
              )}
              <textarea placeholder="Commentaire" value={form.commentaire} onChange={(e) => setForm({...form, commentaire: e.target.value})} style={{...input, minHeight: 80, resize: "vertical"}} />
              <button type="submit" disabled={submitting} style={primaryBtn}>
                {submitting ? "..." : mode === "edit" ? "Modifier" : "Ajouter"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modal = { background: "var(--bg-card, #fff)", color: "var(--text, #222)", borderRadius: 16, width: "90%", maxWidth: 520, maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 12px" };
const closeBtn = { background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted, #888)" };
const statsBar = { display: "flex", justifyContent: "space-between", padding: "0 24px 8px", fontSize: 13, color: "var(--text-muted, #666)" };
const navBar = { display: "flex", gap: 0, borderBottom: "1px solid var(--border, #e5e5e5)", padding: "0 24px" };
const navBtn = { padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--text-muted, #888)", borderBottom: "2px solid transparent" };
const navActive = { ...navBtn, color: "var(--accent, #2563eb)", fontWeight: 600, borderBottom: "2px solid var(--accent, #2563eb)" };
const content = { padding: "16px 24px 24px" };
const emptyText = { color: "var(--text-muted, #888)", textAlign: "center", fontSize: 14 };
const reviewCard = { padding: 12, border: "1px solid var(--border, #e5e5e5)", borderRadius: 8, marginBottom: 10 };
const reviewHeader = { display: "flex", gap: 10, alignItems: "center", marginBottom: 6 };
const reviewNote = { background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600 };
const reviewUser = { fontSize: 13, fontWeight: 500, color: "var(--text, #333)" };
const reviewDate = { fontSize: 11, color: "var(--text-muted, #aaa)", marginLeft: "auto" };
const reviewComment = { margin: "0 0 8px", fontSize: 13, color: "var(--text-muted, #555)", lineHeight: 1.4 };
const reviewActions = { display: "flex", gap: 8 };
const smallBtn = { padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border, #ddd)", background: "var(--bg-input, #f9f9f9)", color: "var(--text, #333)", fontSize: 11, cursor: "pointer" };
const smallBtnDanger = { ...smallBtn, color: "#dc2626", borderColor: "#fecaca" };
const formStyle = { display: "flex", flexDirection: "column", gap: 12 };
const labelStyle = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 500, color: "var(--text, #333)" };
const input = { padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border, #ddd)", fontSize: 14, background: "var(--bg-input, #f9f9f9)", color: "var(--text, #222)" };
const primaryBtn = { padding: "10px", borderRadius: 8, border: "none", background: "var(--accent, #2563eb)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" };
