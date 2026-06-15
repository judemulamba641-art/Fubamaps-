/**
 * Application FubaMaps - Interface mono-page inspiree ChatGPT.
 * Architecture: Header + Zone centrale dynamique + Prompt en bas.
 */

import { useState, useCallback } from "react";
import { useAuth } from "./store/authStore";
import { useUI, MODALS, VIEWS } from "./store/uiStore";

// Components
import LoginModal from "./components/LoginModal";
import SettingsModal from "./components/SettingsModal";
import CommerceModal from "./components/CommerceModal";
import ReviewModal from "./components/ReviewModal";
import ProfileModal from "./components/ProfileModal";
import ChatPrompt from "./components/ChatPrompt";
import CommerceList from "./components/CommerceList";
import ReviewList from "./components/ReviewList";

import "./App.css";

function Header() {
  const { user } = useAuth();
  const { openModal } = useUI();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="logo">FubaMaps</h1>
      </div>
      <div className="header-right">
        <button
          className="header-btn"
          onClick={() => openModal(MODALS.SETTINGS)}
          title="Parametres"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
        <button
          className="header-btn header-profile"
          onClick={() => openModal(MODALS.PROFILE)}
          title="Profil"
        >
          <span className="avatar-mini">
            {(user?.first_name?.[0] || "U").toUpperCase()}
          </span>
        </button>
      </div>
    </header>
  );
}

function MainContent({ searchQuery }) {
  const { currentView } = useUI();

  switch (currentView) {
    case VIEWS.COMMERCE_LIST:
    case VIEWS.SEARCH_RESULTS:
      return <CommerceList searchQuery={searchQuery} />;
    case VIEWS.REVIEWS:
      return <ReviewList />;
    default:
      return <CommerceList searchQuery={searchQuery} />;
  }
}

function ModalRouter() {
  const { activeModal } = useUI();

  switch (activeModal) {
    case MODALS.SETTINGS:
      return <SettingsModal />;
    case MODALS.CREATE_COMMERCE:
    case MODALS.EDIT_COMMERCE:
    case MODALS.VIEW_COMMERCE:
    case MODALS.DELETE_COMMERCE:
      return <CommerceModal />;
    case MODALS.REVIEW:
      return <ReviewModal />;
    case MODALS.PROFILE:
      return <ProfileModal />;
    default:
      return null;
  }
}

function HelpPanel({ onClose }) {
  return (
    <div className="help-panel">
      <div className="help-header">
        <h3>Commandes disponibles</h3>
        <button className="btn-close" onClick={onClose}>&times;</button>
      </div>
      <ul className="help-list">
        <li><code>settings</code> - Ouvrir les parametres</li>
        <li><code>ajouter commerce</code> - Creer un commerce</li>
        <li><code>mes commerces</code> - Afficher la liste</li>
        <li><code>avis</code> - Voir les avis</li>
        <li><code>profil</code> - Voir le profil</li>
        <li><code>aide</code> - Afficher cette aide</li>
        <li><em>Tout autre texte</em> - Recherche de commerces</li>
      </ul>
      <p className="help-note">
        Tapez directement dans le champ ci-dessous pour interagir avec FubaMaps.
      </p>
    </div>
  );
}

export default function App() {
  const { isLoggedIn, loading } = useAuth();
  const { theme } = useUI();
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const { switchView } = useUI();

  const handleCommand = useCallback((type, input) => {
    if (type === "help") {
      setShowHelp(true);
    } else if (type === "search") {
      setSearchQuery(input || "");
      switchView(VIEWS.SEARCH_RESULTS);
    }
  }, [switchView]);

  if (loading) {
    return (
      <div className={`app-container ${theme}`}>
        <div className="loading-screen">
          <h1>FubaMaps</h1>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${theme}`}>
      {!isLoggedIn ? (
        <LoginModal />
      ) : (
        <div className="app-layout">
          <Header />
          <main className="app-main">
            {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
            <MainContent searchQuery={searchQuery} />
          </main>
          <footer className="app-footer">
            <ChatPrompt onCommand={handleCommand} />
          </footer>
          <ModalRouter />
        </div>
      )}
    </div>
  );
}
