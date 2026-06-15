/**
 * Modal Commerce - FubaMaps.
 * Créer, Modifier, Supprimer un commerce via API.
 */

import { useMemo, useState } from "react";
import { useToast } from "./useToast";
import { useCommerces } from "../store/commerceStore";
import {
  createCommerce,
  updateCommerce,
  deleteCommerce,
} from "../services/commerceService";
import {
  getAvailableTypesForCategory,
  normalizePhoneNumber,
  validatePhoneNumber,
} from "./commerceFormUtils";

export default function CommerceModal({ mode = "create", commerce = null, onClose }) {
  const { addToast } = useToast();
  const { categories, types, loadAll } = useCommerces();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState(() => {
    if (mode === "edit" && commerce) {
      return {
        name: commerce.name || "",
        description: commerce.description || "",
        category: commerce.category?.id || "",
        type: commerce.type?.id || "",
        latitude: commerce.latitude ?? "",
        longitude: commerce.longitude ?? "",
        address: commerce.address || "",
        phone: commerce.phone || "",
        opening_hours: commerce.opening_hours || "",
      };
    }
    return {
      name: "",
      description: "",
      category: "",
      type: "",
      latitude: "",
      longitude: "",
      address: "",
      phone: "",
      opening_hours: "",
    };
  });

  const [errors, setErrors] = useState({});

  const availableTypes = useMemo(
    () => getAvailableTypesForCategory(types, form.category),
    [form.category, types]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { type: "" } : {}),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nom requis";
    if (!form.category) errs.category = "Catégorie requise";
    if (!form.type) errs.type = "Type requis";
    if (isNaN(parseFloat(form.latitude))) errs.latitude = "Latitude invalide";
    if (isNaN(parseFloat(form.longitude))) errs.longitude = "Longitude invalide";
    const phoneErr = validatePhoneNumber(form.phone);
    if (phoneErr) errs.phone = phoneErr;
    return errs;
  };

  const buildPayload = () => ({
    name: form.name,
    description: form.description,
    category: parseInt(form.category, 10),
    type: parseInt(form.type, 10),
    latitude: parseFloat(form.latitude),
    longitude: parseFloat(form.longitude),
    address: form.address,
    phone: normalizePhoneNumber(form.phone),
    opening_hours: form.opening_hours,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      addToast("Corrigez les erreurs", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      if (mode === "edit" && commerce) {
        await updateCommerce(commerce.id, payload);
        addToast("Commerce modifié", "success");
      } else {
        await createCommerce(payload);
        addToast("Commerce créé", "success");
      }
      await loadAll();
      onClose();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      await deleteCommerce(commerce.id);
      addToast("Commerce supprimé", "success");
      await loadAll();
      onClose();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const isDelete = mode === "delete";

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h2 style={titleStyle}>
            {isDelete
              ? "Supprimer commerce"
              : mode === "edit"
                ? "Modifier commerce"
                : "Nouveau commerce"}
          </h2>
          <button style={closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div style={body}>
          {isDelete ? (
            <div>
              <p>
                Voulez-vous vraiment supprimer{" "}
                <strong>{commerce?.name}</strong> ?
              </p>
              <p style={{ color: "#ef4444", fontSize: 13 }}>
                Cette action est irréversible.
              </p>
              <div style={btnRow}>
                <button style={cancelBtn} onClick={onClose}>
                  Annuler
                </button>
                <button style={dangerBtn} onClick={handleDelete} disabled={loading}>
                  {loading
                    ? "..."
                    : confirmDelete
                      ? "Confirmer suppression"
                      : "Supprimer"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={formStyle}>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nom du commerce"
                style={input}
              />
              {errors.name && <span style={errStyle}>{errors.name}</span>}

              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                style={input}
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={input}
              >
                <option value="">-- Catégorie --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span style={errStyle}>{errors.category}</span>
              )}

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={input}
              >
                <option value="">-- Type --</option>
                {availableTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.type && <span style={errStyle}>{errors.type}</span>}

              <div style={row}>
                <div style={{ flex: 1 }}>
                  <input
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="Latitude"
                    style={input}
                  />
                  {errors.latitude && (
                    <span style={errStyle}>{errors.latitude}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    style={input}
                  />
                  {errors.longitude && (
                    <span style={errStyle}>{errors.longitude}</span>
                  )}
                </div>
              </div>

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Adresse"
                style={input}
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Téléphone (+243...)"
                style={input}
              />
              {errors.phone && <span style={errStyle}>{errors.phone}</span>}

              <input
                name="opening_hours"
                value={form.opening_hours}
                onChange={handleChange}
                placeholder="Horaires (ex: 8h-18h)"
                style={input}
              />

              <button type="submit" style={submitBtn} disabled={loading}>
                {loading
                  ? "..."
                  : mode === "edit"
                    ? "Enregistrer"
                    : "Créer commerce"}
              </button>
            </form>
          )}
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
  width: "min(500px, 94vw)",
  maxHeight: "90vh",
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

const titleStyle = { margin: 0, fontSize: 18, fontWeight: 700 };

const closeBtn = {
  background: "none",
  border: "none",
  fontSize: 24,
  cursor: "pointer",
  color: "var(--text-muted, #666)",
};

const body = { padding: 24, overflowY: "auto" };

const formStyle = { display: "flex", flexDirection: "column", gap: 10 };

const input = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border, #ddd)",
  fontSize: 14,
  background: "var(--bg-input, #f9f9f9)",
  color: "var(--text, #222)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const row = { display: "flex", gap: 8 };

const errStyle = { color: "#ef4444", fontSize: 12, marginTop: -6 };

const submitBtn = {
  padding: "12px 0",
  borderRadius: 8,
  border: "none",
  background: "var(--accent, #2563eb)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 8,
};

const btnRow = { display: "flex", gap: 10, marginTop: 20 };

const cancelBtn = {
  flex: 1,
  padding: "10px 0",
  borderRadius: 8,
  border: "1px solid var(--border, #ddd)",
  background: "transparent",
  cursor: "pointer",
  fontSize: 14,
  color: "var(--text, #222)",
};

const dangerBtn = {
  flex: 1,
  padding: "10px 0",
  borderRadius: 8,
  border: "none",
  background: "#ef4444",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
