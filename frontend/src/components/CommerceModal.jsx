/**
 * Modal Commerce FubaMaps.
 * Gere creation, modification et suppression de commerces.
 */

import { useState, useEffect } from "react";
import { useCommerce } from "../store/commerceStore";
import { useUI, MODALS } from "../store/uiStore";

export default function CommerceModal() {
  const { categories, types, create, update, remove } = useCommerce();
  const { activeModal, modalData, closeModal } = useUI();

  const isEdit = activeModal === MODALS.EDIT_COMMERCE;
  const isDelete = activeModal === MODALS.DELETE_COMMERCE;
  const isView = activeModal === MODALS.VIEW_COMMERCE;

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    type: "",
    latitude: "",
    longitude: "",
    address: "",
    phone: "",
    opening_hours: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if ((isEdit || isView) && modalData) {
      setForm({
        name: modalData.name || "",
        description: modalData.description || "",
        category: modalData.category?.id || "",
        type: modalData.type?.id || "",
        latitude: modalData.latitude || "",
        longitude: modalData.longitude || "",
        address: modalData.address || "",
        phone: modalData.phone || "",
        opening_hours: modalData.opening_hours || "",
      });
    }
  }, [isEdit, isView, modalData]);

  const filteredTypes = types.filter(
    (t) => !form.category || t.category?.id === Number(form.category)
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "category") {
      setForm((prev) => ({ ...prev, category: value, type: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      category: Number(form.category),
      type: Number(form.type),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
    };

    try {
      if (isEdit && modalData) {
        await update(modalData.id, payload);
      } else {
        await create(payload);
      }
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(modalData.id);
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete confirmation
  if (isDelete) {
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Supprimer le commerce</h2>
            <button className="btn-close" onClick={closeModal}>&times;</button>
          </div>
          <div className="modal-body">
            <p>Voulez-vous vraiment supprimer <strong>{modalData?.name}</strong> ?</p>
            <p className="text-muted">Cette action est irreversible.</p>
            {error && <div className="form-error">{error}</div>}
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={closeModal}>Annuler</button>
            <button className="btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  if (isView) {
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{modalData?.name}</h2>
            <button className="btn-close" onClick={closeModal}>&times;</button>
          </div>
          <div className="modal-body commerce-detail">
            <p><strong>Categorie:</strong> {modalData?.category?.name}</p>
            <p><strong>Type:</strong> {modalData?.type?.name}</p>
            <p><strong>Description:</strong> {modalData?.description || "Aucune"}</p>
            <p><strong>Adresse:</strong> {modalData?.address || "Non renseignee"}</p>
            <p><strong>Telephone:</strong> {modalData?.phone || "Non renseigne"}</p>
            <p><strong>Horaires:</strong> {modalData?.opening_hours || "Non renseignes"}</p>
            <p><strong>Note moyenne:</strong> {modalData?.rating || 0}/5</p>
            <p><strong>Position:</strong> {modalData?.latitude}, {modalData?.longitude}</p>
          </div>
        </div>
      </div>
    );
  }

  // Create/Edit form
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Modifier le commerce" : "Nouveau commerce"}</h2>
          <button className="btn-close" onClick={closeModal}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Nom *</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              placeholder="Nom du commerce"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categorie *</label>
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                required
              >
                <option value="">Choisir...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                required
              >
                <option value="">Choisir...</option>
                {filteredTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description du commerce"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude *</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
                required
                placeholder="-4.3217"
              />
            </div>
            <div className="form-group">
              <label>Longitude *</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
                required
                placeholder="15.3125"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Adresse</label>
            <input
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Adresse complete"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telephone</label>
              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+243..."
              />
            </div>
            <div className="form-group">
              <label>Horaires</label>
              <input
                value={form.opening_hours}
                onChange={(e) => handleChange("opening_hours", e.target.value)}
                placeholder="8h-18h"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "..." : isEdit ? "Modifier" : "Creer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
