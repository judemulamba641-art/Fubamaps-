/**
 * Liste des commerces FubaMaps.
 * Affiche la grille de commerces avec filtres.
 */

import { useEffect, useState, useRef } from "react";
import { useCommerce } from "../store/commerceStore";
import CommerceCard from "./CommerceCard";

export default function CommerceList({ searchQuery }) {
  const { commerces, categories, loading, loadAll } = useCommerce();
  const [filterCategory, setFilterCategory] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadAll();
  }, [loadAll]);

  // Combine prop search with local filter input
  const searchTerm = searchQuery || localSearch;

  const filtered = commerces.filter((c) => {
    const matchCategory = !filterCategory || c.category?.id === Number(filterCategory);
    const matchSearch = !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="commerce-list-container">
      <div className="commerce-list-header">
        <h2>Commerces ({filtered.length})</h2>
        <div className="commerce-filters">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filtrer..."
            className="filter-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement des commerces...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>Aucun commerce trouve.</p>
          <p className="text-muted">Essayez de modifier vos filtres ou ajoutez un commerce.</p>
        </div>
      ) : (
        <div className="commerce-grid">
          {filtered.map((commerce) => (
            <CommerceCard key={commerce.id} commerce={commerce} />
          ))}
        </div>
      )}
    </div>
  );
}
