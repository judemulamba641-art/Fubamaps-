import { useMemo, useState } from "react";
import { useToast } from "./useToast";
import {
  getAvailableTypesForCategory,
  normalizePhoneNumber,
  validatePhoneNumber,
} from "./commerceFormUtils";

export default function EditCommerceModal({
  commerce,
  onClose,
  onUpdated,
  categories = [],
  types = [],
  isDuplicate,
  API,
}) {
  const { addToast } = useToast();
  const buildForm = (currentCommerce) => ({
    name: currentCommerce?.name || "",
    description: currentCommerce?.description || "",
    category: currentCommerce?.category?.id || "",
    type: currentCommerce?.type?.id || "",
    latitude: currentCommerce?.latitude ?? "",
    longitude: currentCommerce?.longitude ?? "",
    address: currentCommerce?.address || "",
    phone: currentCommerce?.phone || "",
    opening_hours: currentCommerce?.opening_hours || "",
  });

  const [form, setForm] = useState(() => buildForm(commerce));
  const [errors, setErrors] = useState({});

  const availableTypes = useMemo(() => {
    return getAvailableTypesForCategory(types, form.category);
  }, [form.category, types]);

  if (!commerce) return null;

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

  const handleUpdate = async () => {
    try {
      const nextErrors = {};

      if (!form.name.trim()) {
        nextErrors.name = "Le nom est requis.";
      }

      if (!form.category) {
        nextErrors.category = "La catégorie est requise.";
      }

      if (!form.type) {
        nextErrors.type = "Le type est requis.";
      } else if (
        !getAvailableTypesForCategory(types, form.category).some(
          (type) => String(type.id) === String(form.type)
        )
      ) {
        nextErrors.type = "Le type choisi ne correspond pas à la catégorie.";
      }

      const phoneError = validatePhoneNumber(form.phone);
      if (phoneError) {
        nextErrors.phone = phoneError;
      }

      const lat = Number.parseFloat(form.latitude);
      const lng = Number.parseFloat(form.longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        if (Number.isNaN(lat)) {
          nextErrors.latitude = "Latitude invalide.";
        }

        if (Number.isNaN(lng)) {
          nextErrors.longitude = "Longitude invalide.";
        }
      }

      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        addToast("❌ Corrigez les erreurs du formulaire", "error");
        return;
      }

      if (isDuplicate && isDuplicate(lat, lng, commerce.id)) {
        addToast("❌ Commerce déjà à proximité", "error");
        return;
      }

      const response = await fetch(`${API}/commerces/${commerce.id}/update/`, {
        method: "PATCH",
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

      addToast("✅ Commerce modifié", "success");
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      addToast("❌ Erreur réseau", "error");
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>✏️ Modifier Commerce</h2>

        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" />
        {errors.name && <div style={errorText}>{errors.name}</div>}
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
        />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">-- Catégorie --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && <div style={errorText}>{errors.category}</div>}

        <select name="type" value={form.type} onChange={handleChange}>
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
          onChange={handleChange}
          placeholder="Latitude"
        />
        {errors.latitude && <div style={errorText}>{errors.latitude}</div>}
        <input
          name="longitude"
          value={form.longitude}
          onChange={handleChange}
          placeholder="Longitude"
        />
        {errors.longitude && <div style={errorText}>{errors.longitude}</div>}
        <input name="address" value={form.address} onChange={handleChange} placeholder="Adresse" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Téléphone" />
        {errors.phone && <div style={errorText}>{errors.phone}</div>}
        <input
          name="opening_hours"
          value={form.opening_hours}
          onChange={handleChange}
          placeholder="Horaires"
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={handleUpdate} style={{ flex: 1 }}>
            💾 Sauvegarder
          </button>
          <button onClick={onClose} style={{ flex: 1 }}>
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
