import { useMemo, useState } from "react";
import { useToast } from "./useToast";
import {
  getAvailableTypesForCategory,
  normalizePhoneNumber,
  validatePhoneNumber,
} from "./commerceFormUtils";

export default function CreateCommerceModal({
  onClose,
  onSuccess,
  categories = [],
  types = [],
  isDuplicate,
  API,
}) {
  const { addToast } = useToast();
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const availableTypes = useMemo(() => {
    return getAvailableTypesForCategory(types, form.category);
  }, [form.category, types]);

  const validateForm = (currentForm) => {
    const nextErrors = {};

    if (!currentForm.name.trim()) {
      nextErrors.name = "Le nom est requis.";
    }

    if (!currentForm.category) {
      nextErrors.category = "La catégorie est requise.";
    }

    if (!currentForm.type) {
      nextErrors.type = "Le type est requis.";
    } else if (
      !getAvailableTypesForCategory(types, currentForm.category).some(
        (type) => String(type.id) === String(currentForm.type)
      )
    ) {
      nextErrors.type = "Le type choisi ne correspond pas à la catégorie.";
    }

    const phoneError = validatePhoneNumber(currentForm.phone);
    if (phoneError) {
      nextErrors.phone = phoneError;
    }

    if (Number.isNaN(Number.parseFloat(currentForm.latitude))) {
      nextErrors.latitude = "Latitude invalide.";
    }

    if (Number.isNaN(Number.parseFloat(currentForm.longitude))) {
      nextErrors.longitude = "Longitude invalide.";
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "category" ? { type: "" } : {}),
    }));

    setErrors((current) => {
      const nextErrors = { ...current };

      if (name === "phone") {
        const phoneError = validatePhoneNumber(value);
        if (phoneError) {
          nextErrors.phone = phoneError;
        } else {
          delete nextErrors.phone;
        }
      }

      if (name === "category") {
        delete nextErrors.category;
        delete nextErrors.type;
      }

      if (name === "type") {
        delete nextErrors.type;
      }

      if (name === "latitude") {
        if (Number.isNaN(Number.parseFloat(value))) {
          nextErrors.latitude = "Latitude invalide.";
        } else {
          delete nextErrors.latitude;
        }
      }

      if (name === "longitude") {
        if (Number.isNaN(Number.parseFloat(value))) {
          nextErrors.longitude = "Longitude invalide.";
        } else {
          delete nextErrors.longitude;
        }
      }

      return nextErrors;
    });
  };

  const handleCreate = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const nextErrors = validateForm(form);
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        addToast("❌ Corrigez les erreurs du formulaire", "error");
        return;
      }

      const lat = Number.parseFloat(form.latitude);
      const lng = Number.parseFloat(form.longitude);

      if (isDuplicate && isDuplicate(lat, lng)) {
        addToast("❌ Commerce déjà à proximité", "error");
        return;
      }

      const response = await fetch(`${API}/commerces/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: Number.parseInt(form.category, 10),
          type: Number.parseInt(form.type, 10),
          latitude: lat,
          longitude: lng,
          address: form.address,
          phone: normalizePhoneNumber(form.phone),
          opening_hours: form.opening_hours,
        }),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        addToast(`❌ ${JSON.stringify(result)}`, "error");
        return;
      }

      addToast("✅ Commerce créé", "success");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      addToast("❌ Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>➕ Nouveau commerce</h2>

        <input
          name="name"
          value={form.name}
          placeholder="Nom"
          onChange={handleChange}
        />
        {errors.name && <div style={errorText}>{errors.name}</div>}
        <input
          name="description"
          value={form.description}
          placeholder="Description"
          onChange={handleChange}
        />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">-- Catégorie --</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && <div style={errorText}>{errors.category}</div>}

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          disabled={!form.category}
        >
          <option value="">-- Type --</option>
          {availableTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.type && <div style={errorText}>{errors.type}</div>}

        <input
          name="latitude"
          value={form.latitude}
          placeholder="Latitude"
          onChange={handleChange}
        />
        {errors.latitude && <div style={errorText}>{errors.latitude}</div>}
        <input
          name="longitude"
          value={form.longitude}
          placeholder="Longitude"
          onChange={handleChange}
        />
        {errors.longitude && <div style={errorText}>{errors.longitude}</div>}
        <input
          name="address"
          value={form.address}
          placeholder="Adresse"
          onChange={handleChange}
        />
        <input
          name="phone"
          value={form.phone}
          placeholder="Téléphone"
          onChange={handleChange}
        />
        {errors.phone && <div style={errorText}>{errors.phone}</div>}
        <input
          name="opening_hours"
          value={form.opening_hours}
          placeholder="Horaires"
          onChange={handleChange}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={handleCreate} disabled={loading} style={{ flex: 1 }}>
            {loading ? "Création..." : "✅ Créer"}
          </button>
          <button onClick={onClose} disabled={loading} style={{ flex: 1 }}>
            ❌ Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  width: 320,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const errorText = {
  color: "#b00020",
  fontSize: 12,
  marginTop: -6,
};
