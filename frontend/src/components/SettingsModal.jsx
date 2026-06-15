import { useState } from "react";
import * as authService from "../services/authService";

/**
 * Modal Settings complet.
 * Sections: Compte, Session, Preferences, A propos.
 */
export default function SettingsModal({ user, onClose, onLogout, theme, onThemeChange, onRefreshUser }) {
  const [section, setSection] = useState("account");
  const [editProfile, setEditProfile] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await authService.updateProfile(profileForm);
      setMsg("Profil mis a jour !");
      setEditProfile(false);
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setMsg(typeof err === "string" ? err : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await authService.changePassword(pwForm);
      setMsg("Mot de passe modifie !");
      setChangePassword(false);
      setPwForm({ old_password: "", new_password: "", new_password_confirm: "" });
    } catch (err) {
      setMsg(typeof err === "string" ? err : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { key: "account", label: "Compte" },
    { key: "session", label: "Session" },
    { key: "prefs", label: "Preferences" },
    { key: "about", label: "A propos" },
  ];

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Parametres</h2>
          <button onClick={onClose} style={closeBtn}>&times;</button>
        </div>

        <div style={tabs}>
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => { setSection(s.key); setMsg(""); }}
              style={section === s.key ? tabActive : tab}
            >
              {s.label}
            </button>
          ))}
        </div>

        {msg && <div style={msgStyle}>{msg}</div>}

        <div style={content}>
          {section === "account" && (
            <div>
              {!editProfile && !changePassword ? (
                <>
                  <div style={infoRow}><b>Email:</b> {user?.email}</div>
                  <div style={infoRow}><b>Nom:</b> {user?.first_name} {user?.last_name}</div>
                  <div style={infoRow}><b>Telephone:</b> {user?.phone_number || "Non renseigne"}</div>
                  <div style={infoRow}><b>Ville:</b> {user?.city || "Non renseignee"}</div>
                  <div style={infoRow}><b>Role:</b> {user?.role}</div>
                  <div style={btnGroup}>
                    <button style={actionBtn} onClick={() => setEditProfile(true)}>Modifier profil</button>
                    <button style={actionBtn} onClick={() => setChangePassword(true)}>Changer mot de passe</button>
                  </div>
                </>
              ) : editProfile ? (
                <form onSubmit={handleUpdateProfile} style={formStyle}>
                  <input placeholder="Prenom" value={profileForm.first_name} onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})} style={input} />
                  <input placeholder="Nom" value={profileForm.last_name} onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})} style={input} />
                  <input placeholder="Telephone" value={profileForm.phone_number} onChange={(e) => setProfileForm({...profileForm, phone_number: e.target.value})} style={input} />
                  <input placeholder="Ville" value={profileForm.city} onChange={(e) => setProfileForm({...profileForm, city: e.target.value})} style={input} />
                  <div style={btnGroup}>
                    <button type="submit" disabled={loading} style={primaryBtn}>{loading ? "..." : "Sauvegarder"}</button>
                    <button type="button" style={actionBtn} onClick={() => setEditProfile(false)}>Annuler</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleChangePassword} style={formStyle}>
                  <input type="password" placeholder="Ancien mot de passe" value={pwForm.old_password} onChange={(e) => setPwForm({...pwForm, old_password: e.target.value})} style={input} required />
                  <input type="password" placeholder="Nouveau mot de passe" value={pwForm.new_password} onChange={(e) => setPwForm({...pwForm, new_password: e.target.value})} style={input} required />
                  <input type="password" placeholder="Confirmer nouveau mot de passe" value={pwForm.new_password_confirm} onChange={(e) => setPwForm({...pwForm, new_password_confirm: e.target.value})} style={input} required />
                  <div style={btnGroup}>
                    <button type="submit" disabled={loading} style={primaryBtn}>{loading ? "..." : "Modifier"}</button>
                    <button type="button" style={actionBtn} onClick={() => setChangePassword(false)}>Annuler</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {section === "session" && (
            <div>
              <p style={{ color: "var(--text-muted, #666)", fontSize: 14 }}>
                Connecte en tant que <b>{user?.email}</b>
              </p>
              <button onClick={onLogout} style={logoutBtn}>Se deconnecter</button>
            </div>
          )}

          {section === "prefs" && (
            <div>
              <p style={{ fontSize: 14, color: "var(--text-muted, #666)", marginBottom: 12 }}>Theme actuel: <b>{theme === "dark" ? "Sombre" : "Clair"}</b></p>
              <div style={btnGroup}>
                <button style={theme === "light" ? primaryBtn : actionBtn} onClick={() => onThemeChange("light")}>Clair</button>
                <button style={theme === "dark" ? primaryBtn : actionBtn} onClick={() => onThemeChange("dark")}>Sombre</button>
              </div>
            </div>
          )}

          {section === "about" && (
            <div>
              <div style={infoRow}><b>Application:</b> FubaMaps</div>
              <div style={infoRow}><b>Version:</b> 2.0.0</div>
              <div style={infoRow}><b>Backend:</b> Django REST Framework</div>
              <div style={infoRow}><b>Frontend:</b> React + Vite</div>
              <div style={infoRow}><b>API:</b> Operationnel</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modal = { background: "var(--bg-card, #fff)", color: "var(--text, #222)", borderRadius: 16, width: "90%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 12px" };
const closeBtn = { background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted, #888)" };
const tabs = { display: "flex", gap: 0, borderBottom: "1px solid var(--border, #e5e5e5)", padding: "0 24px" };
const tab = { padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--text-muted, #888)", borderBottom: "2px solid transparent" };
const tabActive = { ...tab, color: "var(--accent, #2563eb)", fontWeight: 600, borderBottom: "2px solid var(--accent, #2563eb)" };
const content = { padding: "20px 24px 24px" };
const infoRow = { padding: "8px 0", fontSize: 14, borderBottom: "1px solid var(--border, #f0f0f0)" };
const btnGroup = { display: "flex", gap: 8, marginTop: 16 };
const actionBtn = { padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border, #ddd)", background: "var(--bg-input, #f9f9f9)", color: "var(--text, #333)", fontSize: 13, cursor: "pointer" };
const primaryBtn = { ...actionBtn, background: "var(--accent, #2563eb)", color: "#fff", border: "none", fontWeight: 600 };
const logoutBtn = { ...primaryBtn, background: "#dc2626" };
const formStyle = { display: "flex", flexDirection: "column", gap: 10 };
const input = { padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border, #ddd)", fontSize: 14, background: "var(--bg-input, #f9f9f9)", color: "var(--text, #222)" };
const msgStyle = { margin: "12px 24px 0", padding: "8px 12px", borderRadius: 8, background: "#eff6ff", color: "#1d4ed8", fontSize: 13 };
