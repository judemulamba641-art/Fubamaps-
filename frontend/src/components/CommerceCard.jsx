/**
 * Carte commerce individuelle - FubaMaps.
 */

export default function CommerceCard({ commerce, onView, onEdit, onDelete, onReview }) {
  const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

  return (
    <div style={card}>
      <div style={cardHeader}>
        <h3 style={nameStyle}>{commerce.name}</h3>
        {commerce.rating > 0 && (
          <span style={ratingStyle}>
            {stars(commerce.rating)} {commerce.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div style={meta}>
        {commerce.category?.name && (
          <span style={tag}>{commerce.category.name}</span>
        )}
        {commerce.type?.name && (
          <span style={tag}>{commerce.type.name}</span>
        )}
      </div>

      {commerce.address && (
        <p style={addressText}>{commerce.address}</p>
      )}

      {commerce.description && (
        <p style={descText}>{commerce.description}</p>
      )}

      <div style={actions}>
        <button style={actionBtn} onClick={() => onView(commerce)}>
          Voir
        </button>
        <button style={actionBtn} onClick={() => onEdit(commerce)}>
          Modifier
        </button>
        <button style={actionBtn} onClick={() => onReview(commerce)}>
          Avis
        </button>
        <button
          style={{ ...actionBtn, color: "#ef4444" }}
          onClick={() => onDelete(commerce)}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

const card = {
  padding: 16,
  borderRadius: 12,
  border: "1px solid var(--border, #e5e7eb)",
  background: "var(--bg-card, #fff)",
  transition: "box-shadow 0.2s",
  cursor: "default",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 6,
};

const nameStyle = { margin: 0, fontSize: 16, fontWeight: 700 };

const ratingStyle = {
  fontSize: 13,
  color: "#f59e0b",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const meta = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginBottom: 8,
};

const tag = {
  padding: "2px 10px",
  borderRadius: 12,
  background: "var(--accent-bg, #eff6ff)",
  color: "var(--accent, #2563eb)",
  fontSize: 11,
  fontWeight: 600,
};

const addressText = {
  fontSize: 13,
  color: "var(--text-muted, #666)",
  margin: "0 0 4px",
};

const descText = {
  fontSize: 13,
  color: "var(--text-muted, #888)",
  margin: "0 0 10px",
  lineHeight: 1.4,
};

const actions = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const actionBtn = {
  padding: "6px 14px",
  borderRadius: 6,
  border: "1px solid var(--border, #ddd)",
  background: "transparent",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--accent, #2563eb)",
  transition: "background 0.15s",
};
