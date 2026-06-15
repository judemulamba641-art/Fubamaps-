import { useMemo, useState } from "react";
import {
  getAvailableTypesForCategory,
  normalizePhoneNumber,
  validatePhoneNumber,
} from "./commerceFormUtils";
import { apiFetch } from "../services/api";

/**
 * Modal unifie pour creation/edition de commerce.
 * Reutilise les APIs existantes.
 */
export default function CommerceModal({
  commerce,
  categories,
  types,
  onClose,
  onSuccess,
  addToast,
  mode = "create",
}) {
  const isEdit = mode === "edit" && commerce;

  const [form, setForm] = useState({
    name: isEdit ? commerce.name : "",
    description: isEdit ? commerce.description || "" : "",
    category: isEdit ? commerce.category?.id || "" : "",
    type: isEdit ? commerce.type?.id || "" : "",
    latitude: isEdit ? String(commerce.latitude ?? "") : "",
    longitude: isEdit ? String(commerce.longitude ?? "") : "",
    address: isEdit ? commerce.address || "" : "",
    phone: isEdit ? commerce.phone || "" : "",
    opening_hours: isEdit ? commerce.opening_hours || "" : "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const availableTypes = useMemo(() => {
    return getAvailableTypesForCategory(types, form.category);
  }, [form.category, types]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { type: "" } : {}),
    }));
    setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Le nom est requis.";
    if (!form.category) errs.category = "La categorie est requise.";
    if (!form.type) errs.type = "Le type est requis.";
    const phoneErr = validatePhoneNumber(form.phone);
    if (phoneErr) errs.phone = phoneErr;
    if (isNaN(parseFloat(form.latitude))) errs.latitude = "Latitude invalide.";
    if (isNaN(parseFloat(form.longitude))) errs.longitude = "Longitude invalide.";
    return errs;
  };

  const handleSubmit = async () => {
    if (loading) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      addToast?.("Corrigez les erreurs du formulaire", "error");
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        category: parseInt(form.category, 10),
        type: parseInt(form.type, 10),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        address: form.address,
        phone: normalizePhoneNumber(form.phone),
        opening_hours: form.opening_hours,
      };

      let res;
      if (isEdit) {
        res = await apiFetch(`/commerces/${commerce.id}/update/`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        res = await apiFetch("/commerces/", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        addToast?.(JSON.stringify(data), "error");
        return;
      }

      addToast?.(isEdit ? "Commerce modifie !" : "Commerce cree !", "success");
      onSuccess?.();
      onClose();
    } catch {
      addToast?.("Erreur reseau", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{isEdit ? "Modifier commerce" : "Nouveau commerce"}</h2>
          <button onClick={onClose} style={closeBtn}>&times;</button>
        </div>

        <div style={content}>
          <input name="name" value={form.name} placeholder="Nom" onChange={handleChange} style={input} />
          {errors.name && <div style={errStyle}>{errors.name}</div>}

          <input name="description" value={form.description} placeholder="Description" onChange={handleChange} style={input} />

          <select name="category" value={form.category} onChange={handleChange} style={input}>
            <option value="">-- Categorie --</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category && <div style={errStyle}>{errors.category}</div>}

          <select name="type" value={form.type} onChange={handleChange} style={input}>
            <option value="">-- Type --</option>
            {availableTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {errors.type && <div style={errStyle}>{errors.type}</div>}

          <div style={row}>
            <div style={{ flex: 1 }}>
              <input name="latitude" value={form.latitude} placeholder="Latitude" onChange={handleChange} style={input} type="number" step="any" />
              {errors.latitude && <div style={errStyle}>{errors.latitude}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <input name="longitude" value={form.longitude} placeholder="Longitude" onChange={handleChange} style={input} type="number" step="any" />
              {errors.longitude && <div style={errStyle}>{errors.longitude}</div>}
            </div>
          </div>

          <input name="address" value={form.address} placeholder="Adresse" onChange={handleChange} style={input} />
          <input name="phone" value={form.phone} placeholder="Telephone (+243...)" onChange={handleChange} style={input} />
          {errors.phone && <div style={errStyle}>{errors.phone}</div>}
          <input name="opening_hours" value={form.opening_hours} placeholder="Horaires" onChange={handleChange} style={input} />

          <div style={btnGroup}>
            <button onClick={handleSubmit} disabled={loading} style={primaryBtn}>
              {loading ? "..." : isEdit ? "Sauvegarder" : "Creer"}
            </button>
            <button onClick={onClose} style={cancelBtn}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modal = { background: "var(--bg-card, #fff)", color: "var(--text, #222)", borderRadius: 16, width: "90%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 12px" };
const closeBtn = { background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted, #888)" };
const content = { padding: "8px 24px 24px", display: "flex", flexDirection: "column", gap: 10 };
const input = { padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border, #ddd)", fontSize: 14, background: "var(--bg-input, #f9f9f9)", color: "var(--text, #222)", width: "100%", boxSizing: "border-box" };
const errStyle = { color: "#dc2626", fontSize: 12, marginTop: -6 };
const row = { display: "flex", gap: 10 };
const btnGroup = { display: "flex", gap: 8, marginTop: 8 };
const primaryBtn = { padding: "10px 24px", borderRadius: 8, border: "none", background: "var(--accent, #2563eb)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" };
const cancelBtn = { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border, #ddd)", background: "var(--bg-input, #f9f9f9)", color: "var(--text, #333)", fontSize: 14, cursor: "pointer" };
