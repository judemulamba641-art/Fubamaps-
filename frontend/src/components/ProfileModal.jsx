/**
 * Modal Profil FubaMaps.
 * Affiche les informations du profil utilisateur.
 */

import { useAuth } from "../store/authStore";
import { useUI } from "../store/uiStore";

export default function ProfileModal() {
  const { user } = useAuth();
  const { closeModal } = useUI();

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Mon Profil</h2>
          <button className="btn-close" onClick={closeModal}>&times;</button>
        </div>
        <div className="modal-body profile-view">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {(user?.first_name?.[0] || "U").toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h3>{user?.first_name} {user?.last_name}</h3>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-fields">
              <div className="profile-field">
                <span className="field-label">Role</span>
                <span className="field-value">{user?.role || "Utilisateur"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Telephone</span>
                <span className="field-value">{user?.phone_number || "Non renseigne"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Ville</span>
                <span className="field-value">{user?.city || "Non renseignee"}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Membre depuis</span>
                <span className="field-value">
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString("fr-FR") : "-"}
                </span>
              </div>
              <div className="profile-field">
                <span className="field-label">Verifie</span>
                <span className="field-value">{user?.is_verified ? "Oui" : "Non"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
