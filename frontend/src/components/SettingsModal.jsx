/**
 * Modal Settings FubaMaps.
 * Sections: Compte, Session, Preferences, A propos.
 */

import { useState } from "react";
import { useAuth } from "../store/authStore";
import { useUI } from "../store/uiStore";
import { changePassword, updateProfile } from "../services/authService";

export default function SettingsModal() {
  const { user, logout, refreshUser } = useAuth();
  const { closeModal, theme, toggleTheme } = useUI();
  const [section, setSection] = useState("compte");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Change password form
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  // Profile edit
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [city, setCity] = useState(user?.city || "");
  const [editingProfile, setEditingProfile] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPwd !== confirmPwd) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(oldPwd, newPwd, confirmPwd);
      setMessage("Mot de passe modifie avec succes !");
      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        city,
      });
      await refreshUser();
      setMessage("Profil mis a jour !");
      setEditingProfile(false);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    closeModal();
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Parametres</h2>
          <button className="btn-close" onClick={closeModal}>&times;</button>
        </div>

        <div className="settings-layout">
          <nav className="settings-nav">
            <button className={section === "compte" ? "active" : ""} onClick={() => setSection("compte")}>
              Compte
            </button>
            <button className={section === "session" ? "active" : ""} onClick={() => setSection("session")}>
              Session
            </button>
            <button className={section === "preferences" ? "active" : ""} onClick={() => setSection("preferences")}>
              Preferences
            </button>
            <button className={section === "about" ? "active" : ""} onClick={() => setSection("about")}>
              A propos
            </button>
          </nav>

          <div className="settings-content">
            {message && <div className="settings-message">{message}</div>}

            {section === "compte" && (
              <div className="settings-section">
                <h3>Profil</h3>
                {!editingProfile ? (
                  <div className="profile-info">
                    <p><strong>Nom:</strong> {user?.first_name} {user?.last_name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Telephone:</strong> {user?.phone_number || "Non renseigne"}</p>
                    <p><strong>Ville:</strong> {user?.city || "Non renseignee"}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                    <button className="btn-secondary" onClick={() => setEditingProfile(true)}>
                      Modifier le profil
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="settings-form">
                    <div className="form-group">
                      <label>Prenom</label>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Telephone</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243..." />
                    </div>
                    <div className="form-group">
                      <label>Ville</label>
                      <input value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "..." : "Enregistrer"}
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => setEditingProfile(false)}>
                        Annuler
                      </button>
                    </div>
                  </form>
                )}

                <h3>Changer le mot de passe</h3>
                <form onSubmit={handleChangePassword} className="settings-form">
                  <div className="form-group">
                    <label>Ancien mot de passe</label>
                    <input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={8} />
                  </div>
                  <div className="form-group">
                    <label>Confirmer</label>
                    <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required minLength={8} />
                  </div>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "..." : "Modifier"}
                  </button>
                </form>
              </div>
            )}

            {section === "session" && (
              <div className="settings-section">
                <h3>Session</h3>
                <p>Connecte en tant que: <strong>{user?.email}</strong></p>
                <button className="btn-danger" onClick={handleLogout}>
                  Se deconnecter
                </button>
              </div>
            )}

            {section === "preferences" && (
              <div className="settings-section">
                <h3>Theme</h3>
                <div className="theme-toggle">
                  <button
                    className={`btn-theme ${theme === "light" ? "active" : ""}`}
                    onClick={() => theme !== "light" && toggleTheme()}
                  >
                    Clair
                  </button>
                  <button
                    className={`btn-theme ${theme === "dark" ? "active" : ""}`}
                    onClick={() => theme !== "dark" && toggleTheme()}
                  >
                    Sombre
                  </button>
                </div>
              </div>
            )}

            {section === "about" && (
              <div className="settings-section">
                <h3>A propos</h3>
                <p><strong>Version:</strong> 2.0.0</p>
                <p><strong>Plateforme:</strong> FubaMaps</p>
                <p><strong>API Status:</strong> <span className="status-online">En ligne</span></p>
                <p className="about-description">
                  FubaMaps est une plateforme de decouverte de commerces.
                  Trouvez facilement les commerces autour de vous.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
