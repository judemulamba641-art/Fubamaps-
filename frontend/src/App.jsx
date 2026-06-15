/**
 * FubaMaps - Application mono-page style ChatGPT.
 * Header + Zone centrale dynamique + Prompt de commande.
 * Routeur de commandes extensible pour future IA.
 */

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "./store/authStore";
import { useCommerces } from "./store/commerceStore";
import { useUI } from "./store/uiStore";
import { useToast } from "./components/useToast";

import LoginModal from "./components/LoginModal";
import SettingsModal from "./components/SettingsModal";
import ProfileModal from "./components/ProfileModal";
import CommerceModal from "./components/CommerceModal";
import ReviewModal from "./components/ReviewModal";
import CommerceList from "./components/CommerceList";
import ReviewList from "./components/ReviewList";
import ChatPrompt from "./components/ChatPrompt";
import ToastContainer from "./components/ToastContainer";

import "./App.css";

// =========================================================
// Routeur de commandes (extensible pour future IA)
// =========================================================

const COMMAND_ROUTES = [
  { match: /^settings?$/i, action: "settings" },
  { match: /^(ajouter|nouveau|créer|creer)\s*(commerce)?$/i, action: "createCommerce" },
  { match: /^(mes\s+commerces?|liste)$/i, action: "listCommerces" },
  { match: /^(avis|reviews?)$/i, action: "myReviews" },
  { match: /^profil$/i, action: "profile" },
  { match: /^(aide|help)$/i, action: "help" },
];

function routeCommand(text) {
  const normalized = text.trim().toLowerCase();
  for (const route of COMMAND_ROUTES) {
    if (route.match.test(normalized)) {
      return route.action;
    }
  }
  return "search";
}

// =========================================================
// App principale
// =========================================================

export default function App() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { loadAll } = useCommerces();
  const { activeModal, modalData, openModal, closeModal } = useUI();
  const { toasts, removeToast } = useToast();

  const [view, setView] = useState("commerces");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
    }
  }, [isAuthenticated, loadAll]);

  const handleCommand = useCallback(
    (text) => {
      const action = routeCommand(text);

      switch (action) {
        case "settings":
          openModal("settings");
          break;
        case "createCommerce":
          openModal("createCommerce");
          break;
        case "listCommerces":
          setView("commerces");
          setSearchQuery("");
          break;
        case "myReviews":
          setView("reviews");
          break;
        case "profile":
          openModal("profile");
          break;
        case "help":
          setView("help");
          break;
        case "search":
        default:
          setView("commerces");
          setSearchQuery(text);
          break;
      }
    },
    [openModal]
  );

  if (authLoading) {
    return (
      <div className="fm-loading">
        <h1 className="fm-logo-text">FubaMaps</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginModal />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="fm-app">
      {/* ===== HEADER ===== */}
      <header className="fm-header">
        <div className="fm-header-left">
          <h1
            className="fm-logo"
            onClick={() => {
              setView("commerces");
              setSearchQuery("");
            }}
          >
            FubaMaps
          </h1>
        </div>
        <div className="fm-header-right">
          <button
            className="fm-header-btn"
            onClick={() => openModal("settings")}
            title="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            className="fm-header-btn fm-avatar-btn"
            onClick={() => openModal("profile")}
            title="Profil"
          >
            {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
          </button>
        </div>
      </header>

      {/* ===== ZONE CENTRALE ===== */}
      <main className="fm-main">
        <div className="fm-content">
          {view === "commerces" && <CommerceList searchQuery={searchQuery} />}
          {view === "reviews" && <ReviewList />}
          {view === "help" && (
            <div className="fm-help">
              <h2>Commandes disponibles</h2>
              <ul>
                <li><strong>settings</strong> — Ouvrir les paramètres</li>
                <li><strong>ajouter commerce</strong> — Créer un nouveau commerce</li>
                <li><strong>mes commerces</strong> — Afficher la liste des commerces</li>
                <li><strong>avis</strong> — Voir mes avis</li>
                <li><strong>profil</strong> — Voir mon profil</li>
                <li><strong>aide</strong> — Afficher cette aide</li>
                <li><em>Autre texte</em> — Rechercher dans les commerces</li>
              </ul>
              <p className="fm-help-note">
                Architecture extensible : les futures commandes IA seront intégrées ici.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ===== PROMPT CHATGPT-STYLE ===== */}
      <ChatPrompt onCommand={handleCommand} />

      {/* ===== MODALES ===== */}
      {activeModal === "settings" && (
        <SettingsModal onClose={closeModal} />
      )}
      {activeModal === "profile" && (
        <ProfileModal onClose={closeModal} />
      )}
      {activeModal === "createCommerce" && (
        <CommerceModal mode="create" onClose={closeModal} />
      )}
      {activeModal === "editCommerce" && modalData && (
        <CommerceModal mode="edit" commerce={modalData} onClose={closeModal} />
      )}
      {activeModal === "deleteCommerce" && modalData && (
        <CommerceModal mode="delete" commerce={modalData} onClose={closeModal} />
      )}
      {activeModal === "viewCommerce" && modalData && (
        <div className="fm-modal-overlay" onClick={closeModal}>
          <div className="fm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="fm-modal-header">
              <h2>Détails du commerce</h2>
              <button className="fm-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="fm-modal-body">
              <p><strong>Nom :</strong> {modalData.name}</p>
              <p><strong>Description :</strong> {modalData.description || "—"}</p>
              <p><strong>Catégorie :</strong> {modalData.category?.name || "—"}</p>
              <p><strong>Type :</strong> {modalData.type?.name || "—"}</p>
              <p><strong>Adresse :</strong> {modalData.address || "—"}</p>
              <p><strong>Téléphone :</strong> {modalData.phone || "—"}</p>
              <p><strong>Horaires :</strong> {modalData.opening_hours || "—"}</p>
              <p><strong>Latitude :</strong> {modalData.latitude}</p>
              <p><strong>Longitude :</strong> {modalData.longitude}</p>
            </div>
          </div>
        </div>
      )}
      {activeModal === "review" && modalData && (
        <ReviewModal commerce={modalData} onClose={closeModal} />
      )}

      {/* ===== TOASTS ===== */}
      <div className="fm-toasts">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
}
