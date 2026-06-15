/**
 * Carte commerce FubaMaps.
 * Affiche un commerce avec ses informations et boutons d'action.
 */

import { useUI, MODALS } from "../store/uiStore";

export default function CommerceCard({ commerce }) {
  const { openModal } = useUI();

  const renderStars = (rating) => {
    const r = Math.round(rating || 0);
    return "★".repeat(r) + "☆".repeat(5 - r);
  };

  return (
    <div className="commerce-card">
      <div className="commerce-card-header">
        <h3 className="commerce-name">{commerce.name}</h3>
        <span className="commerce-rating">{renderStars(commerce.rating)}</span>
      </div>

      <div className="commerce-card-body">
        <div className="commerce-meta">
          {commerce.category && (
            <span className="commerce-badge">{commerce.category.name}</span>
          )}
          {commerce.type && (
            <span className="commerce-badge commerce-badge-type">{commerce.type.name}</span>
          )}
        </div>
        {commerce.address && <p className="commerce-address">{commerce.address}</p>}
        {commerce.phone && <p className="commerce-phone">{commerce.phone}</p>}
        {commerce.opening_hours && <p className="commerce-hours">{commerce.opening_hours}</p>}
      </div>

      <div className="commerce-card-actions">
        <button
          className="btn-action"
          onClick={() => openModal(MODALS.VIEW_COMMERCE, commerce)}
          title="Voir details"
        >
          Voir
        </button>
        <button
          className="btn-action"
          onClick={() => openModal(MODALS.EDIT_COMMERCE, commerce)}
          title="Modifier"
        >
          Modifier
        </button>
        <button
          className="btn-action"
          onClick={() => openModal(MODALS.DELETE_COMMERCE, commerce)}
          title="Supprimer"
        >
          Supprimer
        </button>
        <button
          className="btn-action btn-action-review"
          onClick={() => openModal(MODALS.REVIEW, commerce)}
          title="Avis"
        >
          Avis
        </button>
      </div>
    </div>
  );
}
