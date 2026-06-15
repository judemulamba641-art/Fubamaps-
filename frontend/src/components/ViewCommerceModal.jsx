/**
 * Modal de details d'un commerce.
 */
export default function ViewCommerceModal({ commerce, onClose }) {
  if (!commerce) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Details du commerce</h2>
          <button onClick={onClose} style={closeBtn}>&times;</button>
        </div>
        <div style={content}>
          <div style={row}><b>Nom:</b> {commerce.name}</div>
          <div style={row}><b>Description:</b> {commerce.description || "-"}</div>
          <div style={row}><b>Categorie:</b> {commerce.category?.name || "-"}</div>
          <div style={row}><b>Type:</b> {commerce.type?.name || "-"}</div>
          <div style={row}><b>Latitude:</b> {commerce.latitude}</div>
          <div style={row}><b>Longitude:</b> {commerce.longitude}</div>
          <div style={row}><b>Adresse:</b> {commerce.address || "-"}</div>
          <div style={row}><b>Telephone:</b> {commerce.phone || "-"}</div>
          <div style={row}><b>Horaires:</b> {commerce.opening_hours || "-"}</div>
          {commerce.rating > 0 && (
            <div style={row}><b>Note moyenne:</b> {commerce.rating}/5</div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modal = { background: "var(--bg-card, #fff)", color: "var(--text, #222)", borderRadius: 16, width: "90%", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 12px" };
const closeBtn = { background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted, #888)" };
const content = { padding: "8px 24px 24px" };
const row = { padding: "8px 0", fontSize: 14, borderBottom: "1px solid var(--border, #f0f0f0)" };
