import CommerceCard from "./CommerceCard";

/**
 * Liste de commerces avec recherche inline.
 */
export default function CommerceList({ commerces, onAction, searchQuery }) {
  const filtered = searchQuery
    ? commerces.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.type?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commerces;

  if (filtered.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>
          {searchQuery
            ? `Aucun commerce trouve pour "${searchQuery}"`
            : "Aucun commerce disponible"}
        </p>
        <button
          style={styles.createBtn}
          onClick={() => onAction("create_commerce")}
        >
          + Ajouter un commerce
        </button>
      </div>
    );
  }

  return (
    <div style={styles.list}>
      <div style={styles.header}>
        <span style={styles.count}>{filtered.length} commerce(s)</span>
      </div>
      {filtered.map((c) => (
        <CommerceCard key={c.id} commerce={c} onAction={onAction} />
      ))}
    </div>
  );
}

const styles = {
  list: {
    padding: "0 0 100px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  count: {
    fontSize: 13,
    color: "var(--text-muted, #888)",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyText: {
    color: "var(--text-muted, #888)",
    fontSize: 15,
    marginBottom: 16,
  },
  createBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    background: "var(--accent, #2563eb)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
