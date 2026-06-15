/**
 * Carte individuelle d'un commerce.
 */
export default function CommerceCard({ commerce, onAction }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>{commerce.name}</h3>
        {commerce.rating > 0 && (
          <span style={styles.rating}>{commerce.rating.toFixed(1)}/5</span>
        )}
      </div>

      <div style={styles.meta}>
        {commerce.category?.name && (
          <span style={styles.tag}>{commerce.category.name}</span>
        )}
        {commerce.type?.name && (
          <span style={styles.tagType}>{commerce.type.name}</span>
        )}
      </div>

      {commerce.description && (
        <p style={styles.desc}>{commerce.description}</p>
      )}

      <div style={styles.info}>
        {commerce.address && <span>{commerce.address}</span>}
        {commerce.phone && <span>{commerce.phone}</span>}
      </div>

      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={() => onAction("view", commerce)}>
          Voir
        </button>
        <button style={styles.actionBtn} onClick={() => onAction("edit", commerce)}>
          Modifier
        </button>
        <button style={styles.actionBtn} onClick={() => onAction("reviews", commerce)}>
          Avis
        </button>
        <button style={{ ...styles.actionBtn, ...styles.deleteBtn }} onClick={() => onAction("delete", commerce)}>
          Supprimer
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "var(--bg-card, #fff)",
    border: "1px solid var(--border, #e5e5e5)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text, #222)",
  },
  rating: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  meta: {
    display: "flex",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  tag: {
    background: "var(--accent-bg, #eff6ff)",
    color: "var(--accent, #2563eb)",
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 500,
  },
  tagType: {
    background: "#f0fdf4",
    color: "#166534",
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 500,
  },
  desc: {
    margin: "0 0 8px",
    fontSize: 13,
    color: "var(--text-muted, #666)",
    lineHeight: 1.4,
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    fontSize: 12,
    color: "var(--text-muted, #888)",
    marginBottom: 10,
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  actionBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid var(--border, #ddd)",
    background: "var(--bg-input, #f9f9f9)",
    color: "var(--text, #333)",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
  },
  deleteBtn: {
    color: "#dc2626",
    borderColor: "#fecaca",
    background: "#fef2f2",
  },
};
