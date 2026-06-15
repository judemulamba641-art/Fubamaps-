/**
 * Affichage de la liste des avis (vue principale).
 */
export default function ReviewList({ reviews, onSelectCommerce }) {
  if (reviews.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>Aucun avis disponible</p>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      <div style={styles.header}>
        <span style={styles.count}>{reviews.length} avis</span>
      </div>
      {reviews.map((rev) => (
        <div key={rev.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.note}>{rev.note}/5</span>
            <span style={styles.user}>{rev.user_name || "Anonyme"}</span>
            <span style={styles.date}>
              {rev.created_at ? new Date(rev.created_at).toLocaleDateString("fr-FR") : ""}
            </span>
          </div>
          {rev.commerce && (
            <button
              style={styles.commerceLink}
              onClick={() => onSelectCommerce?.(rev.commerce)}
            >
              {rev.commerce.name}
            </button>
          )}
          {rev.commentaire && <p style={styles.comment}>{rev.commentaire}</p>}
        </div>
      ))}
    </div>
  );
}

const styles = {
  list: { padding: "0 0 100px" },
  header: { marginBottom: 12 },
  count: { fontSize: 13, color: "var(--text-muted, #888)" },
  empty: { textAlign: "center", padding: "60px 20px" },
  emptyText: { color: "var(--text-muted, #888)", fontSize: 15 },
  card: { padding: 14, border: "1px solid var(--border, #e5e5e5)", borderRadius: 10, marginBottom: 10, background: "var(--bg-card, #fff)" },
  cardHeader: { display: "flex", gap: 10, alignItems: "center", marginBottom: 6 },
  note: { background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600 },
  user: { fontSize: 13, fontWeight: 500 },
  date: { fontSize: 11, color: "var(--text-muted, #aaa)", marginLeft: "auto" },
  commerceLink: { background: "none", border: "none", color: "var(--accent, #2563eb)", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 4, textAlign: "left", textDecoration: "underline" },
  comment: { margin: 0, fontSize: 13, color: "var(--text-muted, #555)", lineHeight: 1.4 },
};
