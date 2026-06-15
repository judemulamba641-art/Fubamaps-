import { useState } from "react";
import { apiFetch } from "../services/api";

/**
 * Modal de confirmation de suppression d'un commerce.
 */
export default function DeleteConfirmModal({
  commerce,
  onClose,
  onDeleteSuccess,
  addToast,
}) {
  const [loading, setLoading] = useState(false);

  if (!commerce) return null;

  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await apiFetch(`/commerces/${commerce.id}/delete/`, {
        method: "DELETE",
      });

      if (res.status === 200 || res.status === 204) {
        addToast?.("Commerce supprime", "success");
        onDeleteSuccess(commerce.id);
        return;
      }

      let errorMsg = "Erreur suppression";
      try {
        const data = await res.json();
        errorMsg = JSON.stringify(data);
      } catch {
        // ignore
      }
      addToast?.(errorMsg, "error");
    } catch {
      addToast?.("Erreur reseau", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ marginTop: 0 }}>Confirmer la suppression</h3>
        <p style={{ fontSize: 14, color: "var(--text-muted, #666)" }}>
          Voulez-vous vraiment supprimer <b>{commerce.name}</b> ?
          Cette action est irreversible.
        </p>
        <div style={btnGroup}>
          <button onClick={handleDelete} disabled={loading} style={deleteBtn}>
            {loading ? "Suppression..." : "Supprimer"}
          </button>
          <button onClick={onClose} style={cancelBtn}>
            Annuler
          </button>
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
};

const modal = {
  background: "var(--bg-card, #fff)",
  color: "var(--text, #222)",
  padding: "24px",
  width: "90%",
  maxWidth: 380,
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
};

const btnGroup = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const deleteBtn = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const cancelBtn = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "1px solid var(--border, #ddd)",
  background: "var(--bg-input, #f9f9f9)",
  color: "var(--text, #333)",
  fontSize: 14,
  cursor: "pointer",
};
