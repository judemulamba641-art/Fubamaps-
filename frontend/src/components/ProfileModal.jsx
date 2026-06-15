/**
 * Modal Profil utilisateur - FubaMaps.
 */

import { useAuth } from "../store/authStore";

export default function ProfileModal({ onClose }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h2 style={title}>Mon Profil</h2>
          <button style={closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div style={body}>
          <div style={avatarSection}>
            <div style={avatarCircle}>
              {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <h3 style={nameText}>
              {user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email}
            </h3>
            <span style={roleTag}>{user.role}</span>
          </div>

          <div style={infoGrid}>
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Téléphone" value={user.phone_number || "Non renseigné"} />
            <InfoRow label="Ville" value={user.city || "Non renseignée"} />
            <InfoRow
              label="Vérifié"
              value={user.is_verified ? "Oui" : "Non"}
            />
            <InfoRow
              label="Membre depuis"
              value={
                user.date_joined
                  ? new Date(user.date_joined).toLocaleDateString("fr-FR")
                  : "-"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={infoRow}>
      <span style={infoLabel}>{label}</span>
      <span>{value}</span>
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
  width: "min(440px, 92vw)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 24px",
  borderBottom: "1px solid var(--border, #eee)",
};

const title = { margin: 0, fontSize: 18, fontWeight: 700 };

const closeBtn = {
  background: "none",
  border: "none",
  fontSize: 24,
  cursor: "pointer",
  color: "var(--text-muted, #666)",
};

const body = { padding: 24 };

const avatarSection = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 24,
};

const avatarCircle = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "var(--accent, #2563eb)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 12,
};

const nameText = { margin: "0 0 6px", fontSize: 18, fontWeight: 700 };

const roleTag = {
  padding: "4px 14px",
  borderRadius: 20,
  background: "var(--accent-bg, #eff6ff)",
  color: "var(--accent, #2563eb)",
  fontSize: 12,
  fontWeight: 600,
};

const infoGrid = { display: "flex", flexDirection: "column", gap: 0 };

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid var(--border, #f0f0f0)",
  fontSize: 14,
};

const infoLabel = { fontWeight: 600, color: "var(--text-muted, #666)" };
