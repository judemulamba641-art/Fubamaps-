/**
 * Modal Settings - FubaMaps.
 * Sections : Compte, Session, Préférences, À propos.
 */

import { useState } from "react";
import { useAuth } from "../store/authStore";
import { useUI } from "../store/uiStore";
import { useToast } from "./useToast";
import { changePassword, updateProfile } from "../services/authService";

export default function SettingsModal({ onClose }) {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useUI();
  const { addToast } = useToast();

  const [section, setSection] = useState("account");
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
    city: user?.city || "",
  });

  const [pwForm, setPwForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileForm);
      await refreshUser();
      addToast("Profil mis à jour", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.new_password_confirm) {
      addToast("Les mots de passe ne correspondent pas", "error");
      return;
    }
    setLoading(true);
    try {
      await changePassword(
        pwForm.old_password,
        pwForm.new_password,
        pwForm.new_password_confirm
      );
      addToast("Mot de passe modifié", "success");
      setPwForm({ old_password: "", new_password: "", new_password_confirm: "" });
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const sections = [
    { key: "account", label: "Compte" },
    { key: "session", label: "Session" },
    { key: "preferences", label: "Préférences" },
    { key: "about", label: "À propos" },
  ];

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h2 style={title}>Settings</h2>
          <button style={closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div style={layout}>
          <nav style={sidebar}>
            {sections.map((s) => (
              <button
                key={s.key}
                style={section === s.key ? navActive : navBtn}
                onClick={() => setSection(s.key)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div style={content}>
            {section === "account" && (
              <div>
                <h3 style={sectionTitle}>Profil</h3>
                <div style={infoRow}>
                  <span style={infoLabel}>Email</span>
                  <span>{user?.email}</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Rôle</span>
                  <span>{user?.role}</span>
                </div>

                <h3 style={{ ...sectionTitle, marginTop: 20 }}>Modifier profil</h3>
                <form onSubmit={handleUpdateProfile} style={formStyle}>
                  <input
                    placeholder="Prénom"
                    value={profileForm.first_name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, first_name: e.target.value })
                    }
                    style={input}
                  />
                  <input
                    placeholder="Nom"
                    value={profileForm.last_name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, last_name: e.target.value })
                    }
                    style={input}
                  />
                  <input
                    placeholder="Téléphone"
                    value={profileForm.phone_number}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone_number: e.target.value })
                    }
                    style={input}
                  />
                  <input
                    placeholder="Ville"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                    style={input}
                  />
                  <button type="submit" style={actionBtn} disabled={loading}>
                    {loading ? "..." : "Sauvegarder"}
                  </button>
                </form>

                <h3 style={{ ...sectionTitle, marginTop: 24 }}>Changer mot de passe</h3>
                <form onSubmit={handleChangePassword} style={formStyle}>
                  <input
                    type="password"
                    placeholder="Ancien mot de passe"
                    value={pwForm.old_password}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, old_password: e.target.value })
                    }
                    style={input}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={pwForm.new_password}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, new_password: e.target.value })
                    }
                    style={input}
                    required
                    minLength={8}
                  />
                  <input
                    type="password"
                    placeholder="Confirmer nouveau mot de passe"
                    value={pwForm.new_password_confirm}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, new_password_confirm: e.target.value })
                    }
                    style={input}
                    required
                    minLength={8}
                  />
                  <button type="submit" style={actionBtn} disabled={loading}>
                    {loading ? "..." : "Changer mot de passe"}
                  </button>
                </form>
              </div>
            )}

            {section === "session" && (
              <div>
                <h3 style={sectionTitle}>Session</h3>
                <p style={infoText}>Connecté en tant que : {user?.email}</p>
                <button style={dangerBtn} onClick={handleLogout}>
                  Se déconnecter
                </button>
              </div>
            )}

            {section === "preferences" && (
              <div>
                <h3 style={sectionTitle}>Thème</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    style={theme === "light" ? themeActive : themeBtn}
                    onClick={() => setTheme("light")}
                  >
                    Clair
                  </button>
                  <button
                    style={theme === "dark" ? themeActive : themeBtn}
                    onClick={() => setTheme("dark")}
                  >
                    Sombre
                  </button>
                </div>
              </div>
            )}

            {section === "about" && (
              <div>
                <h3 style={sectionTitle}>À propos</h3>
                <div style={infoRow}>
                  <span style={infoLabel}>Version</span>
                  <span>1.0.0</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>Plateforme</span>
                  <span>FubaMaps - Django + React</span>
                </div>
                <div style={infoRow}>
                  <span style={infoLabel}>API</span>
                  <span style={{ color: "#22c55e" }}>En ligne</span>
                </div>
              </div>
            )}
          </div>
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
  backdropFilter: "blur(3px)",
};

const modal = {
  background: "var(--bg-card, #fff)",
  color: "var(--text, #222)",
  borderRadius: 16,
  width: "min(680px, 94vw)",
  maxHeight: "85vh",
  overflow: "hidden",
  boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
  display: "flex",
  flexDirection: "column",
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
  padding: "0 4px",
};

const layout = {
  display: "flex",
  flex: 1,
  overflow: "hidden",
  minHeight: 0,
};

const sidebar = {
  width: 160,
  borderRight: "1px solid var(--border, #eee)",
  display: "flex",
  flexDirection: "column",
  padding: "12px 0",
  flexShrink: 0,
};

const navBtn = {
  background: "none",
  border: "none",
  padding: "10px 20px",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 14,
  color: "var(--text-muted, #666)",
  transition: "all 0.15s",
};

const navActive = {
  ...navBtn,
  background: "var(--accent-bg, #eff6ff)",
  color: "var(--accent, #2563eb)",
  fontWeight: 600,
};

const content = {
  flex: 1,
  padding: 24,
  overflowY: "auto",
};

const sectionTitle = { fontSize: 15, fontWeight: 700, margin: "0 0 12px" };

const formStyle = { display: "flex", flexDirection: "column", gap: 10 };

const input = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border, #ddd)",
  fontSize: 14,
  background: "var(--bg-input, #f9f9f9)",
  color: "var(--text, #222)",
  outline: "none",
  boxSizing: "border-box",
};

const actionBtn = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "var(--accent, #2563eb)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  alignSelf: "flex-start",
  marginTop: 4,
};

const dangerBtn = {
  ...actionBtn,
  background: "#ef4444",
  marginTop: 12,
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid var(--border, #f0f0f0)",
  fontSize: 14,
};

const infoLabel = { fontWeight: 600, color: "var(--text-muted, #666)" };
const infoText = { fontSize: 14, color: "var(--text-muted, #666)", margin: "0 0 12px" };

const themeBtn = {
  padding: "10px 24px",
  borderRadius: 8,
  border: "1px solid var(--border, #ddd)",
  background: "transparent",
  cursor: "pointer",
  fontSize: 14,
  color: "var(--text, #222)",
};

const themeActive = {
  ...themeBtn,
  background: "var(--accent, #2563eb)",
  color: "#fff",
  border: "1px solid var(--accent, #2563eb)",
};
