/**
 * Modal Profil utilisateur (lecture seule).
 */
export default function ProfileModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Mon Profil</h2>
          <button onClick={onClose} style={closeBtn}>&times;</button>
        </div>

        <div style={content}>
          <div style={avatar}>
            {user.first_name?.[0]?.toUpperCase() || "U"}
          </div>

          <div style={row}><b>Nom complet:</b> {user.first_name} {user.last_name}</div>
          <div style={row}><b>Email:</b> {user.email}</div>
          <div style={row}><b>Telephone:</b> {user.phone_number || "Non renseigne"}</div>
          <div style={row}><b>Ville:</b> {user.city || "Non renseignee"}</div>
          <div style={row}><b>Role:</b> {user.role}</div>
          <div style={row}><b>Verifie:</b> {user.is_verified ? "Oui" : "Non"}</div>
          <div style={row}><b>Membre depuis:</b> {user.date_joined ? new Date(user.date_joined).toLocaleDateString("fr-FR") : "-"}</div>
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
const avatar = { width: 64, height: 64, borderRadius: "50%", background: "var(--accent, #2563eb)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, margin: "0 auto 20px" };
const row = { padding: "8px 0", fontSize: 14, borderBottom: "1px solid var(--border, #f0f0f0)" };
