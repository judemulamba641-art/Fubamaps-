/**
 * Liste des commerces - FubaMaps.
 */

import { useCommerces } from "../store/commerceStore";
import { useUI } from "../store/uiStore";
import CommerceCard from "./CommerceCard";

export default function CommerceList({ searchQuery }) {
  const { commerces, loading } = useCommerces();
  const { openModal } = useUI();

  const filtered = searchQuery
    ? commerces.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.category?.name?.toLowerCase().includes(q) ||
          c.type?.name?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        );
      })
    : commerces;

  if (loading) {
    return <p style={statusText}>Chargement des commerces...</p>;
  }

  if (filtered.length === 0) {
    return (
      <p style={statusText}>
        {searchQuery
          ? `Aucun résultat pour "${searchQuery}"`
          : "Aucun commerce disponible"}
      </p>
    );
  }

  return (
    <div style={grid}>
      {filtered.map((commerce) => (
        <CommerceCard
          key={commerce.id}
          commerce={commerce}
          onView={(c) => openModal("viewCommerce", c)}
          onEdit={(c) => openModal("editCommerce", c)}
          onDelete={(c) => openModal("deleteCommerce", c)}
          onReview={(c) => openModal("review", c)}
        />
      ))}
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 14,
  padding: "0 0 20px",
};

const statusText = {
  textAlign: "center",
  color: "var(--text-muted, #888)",
  fontSize: 14,
  padding: "40px 20px",
};
