import { useCallback, useEffect, useState } from "react";

import { useToast } from "./components/useToast";
import ToastContainer from "./components/ToastContainer";

import LoginModal from "./components/LoginModal";
import ChatPrompt from "./components/ChatPrompt";
import CommerceList from "./components/CommerceList";
import CommerceCard from "./components/CommerceCard";
import CommerceModal from "./components/CommerceModal";
import ReviewModal from "./components/ReviewModal";
import ReviewList from "./components/ReviewList";
import SettingsModal from "./components/SettingsModal";
import ProfileModal from "./components/ProfileModal";
import ViewCommerceModal from "./components/ViewCommerceModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

import { useAuthStore } from "./store/authStore";
import { useCommerceStore } from "./store/commerceStore";
import { useReviewStore } from "./store/reviewStore";
import { useUIStore } from "./store/uiStore";
import { parseCommand } from "./services/aiService";

/**
 * Application principale FubaMaps - Architecture mono-page.
 * Layout inspire de ChatGPT : Header | Zone centrale | Prompt.
 */
export default function App() {
  const { addToast, toasts, removeToast } = useToast();
  const auth = useAuthStore();
  const commerce = useCommerceStore();
  const review = useReviewStore();
  const ui = useUIStore();

  const [view, setView] = useState("commerces"); // commerces | reviews | search
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([
    "mes commerces",
    "ajouter commerce",
    "avis",
    "settings",
    "profil",
  ]);

  // Load data after authentication
  useEffect(() => {
    if (auth.authenticated) {
      commerce.loadAll().catch(() => addToast("Erreur chargement donnees", "error"));
    }
  }, [auth.authenticated]);

  // Command router (Task 4)
  const handleCommand = useCallback(
    (input) => {
      const result = parseCommand(input);

      ui.addMessage({ role: "user", text: input });

      switch (result.action || result.type) {
        case "settings":
          ui.openModal("settings");
          ui.addMessage({ role: "system", text: "Ouverture des parametres..." });
          break;

        case "create_commerce":
          ui.openModal("create_commerce");
          ui.addMessage({ role: "system", text: "Formulaire de creation ouvert." });
          break;

        case "list_commerces":
          setView("commerces");
          setSearchQuery("");
          ui.addMessage({ role: "system", text: `${commerce.commerces.length} commerce(s) affiches.` });
          break;

        case "reviews":
          setView("reviews");
          review.loadAll().catch(() => addToast("Erreur chargement avis", "error"));
          ui.addMessage({ role: "system", text: "Chargement des avis..." });
          break;

        case "profile":
          ui.openModal("profile");
          ui.addMessage({ role: "system", text: "Votre profil." });
          break;

        case "logout":
          auth.doLogout();
          ui.addMessage({ role: "system", text: "Deconnexion..." });
          break;

        case "help":
          ui.addMessage({
            role: "system",
            text: "Commandes disponibles: mes commerces, ajouter commerce, avis, settings, profil, deconnexion",
          });
          setSuggestions([
            "mes commerces",
            "ajouter commerce",
            "avis",
            "settings",
            "profil",
          ]);
          break;

        case "dark_mode":
          ui.setTheme("dark");
          ui.addMessage({ role: "system", text: "Theme sombre active." });
          break;

        case "light_mode":
          ui.setTheme("light");
          ui.addMessage({ role: "system", text: "Theme clair active." });
          break;

        case "search":
          setView("commerces");
          setSearchQuery(result.query);
          ui.addMessage({ role: "system", text: `Recherche: "${result.query}"` });
          break;

        default:
          // Unknown command - treat as search
          setView("commerces");
          setSearchQuery(input);
          ui.addMessage({
            role: "system",
            text: `Recherche de "${input}"... Commandes: settings, ajouter commerce, mes commerces, avis, profil`,
          });
          break;
      }
    },
    [commerce.commerces.length, auth, ui, review, addToast]
  );

  // Commerce actions handler
  const handleCommerceAction = useCallback(
    (action, data) => {
      switch (action) {
        case "view":
          ui.openModal("view_commerce", data);
          break;
        case "edit":
          ui.openModal("edit_commerce", data);
          break;
        case "delete":
          ui.openModal("delete_commerce", data);
          break;
        case "reviews":
          ui.openModal("reviews", data);
          break;
        case "create_commerce":
          ui.openModal("create_commerce");
          break;
        default:
          break;
      }
    },
    [ui]
  );

  // Show loading
  if (auth.loading) {
    return (
      <div style={styles.loading}>
        <h2 style={{ color: "var(--accent, #2563eb)" }}>FubaMaps</h2>
        <p>Chargement...</p>
      </div>
    );
  }

  // Show login modal if not authenticated (Task 2)
  if (!auth.authenticated) {
    return (
      <>
        <LoginModal onLogin={auth.doLogin} onRegister={auth.doRegister} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo} onClick={() => { setView("commerces"); setSearchQuery(""); }}>
            FubaMaps
          </h1>
        </div>
        <div style={styles.headerRight}>
          <button
            style={styles.headerBtn}
            onClick={() => ui.openModal("settings")}
            title="Parametres"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button
            style={styles.profileBtn}
            onClick={() => ui.openModal("profile")}
            title="Profil"
          >
            {auth.user?.first_name?.[0]?.toUpperCase() || "U"}
          </button>
        </div>
      </header>

      {/* ZONE CENTRALE */}
      <main style={styles.main}>
        <div style={styles.content}>
          {/* Navigation tabs */}
          <div style={styles.viewTabs}>
            <button
              style={view === "commerces" ? styles.viewTabActive : styles.viewTab}
              onClick={() => { setView("commerces"); setSearchQuery(""); }}
            >
              Commerces ({commerce.commerces.length})
            </button>
            <button
              style={view === "reviews" ? styles.viewTabActive : styles.viewTab}
              onClick={() => {
                setView("reviews");
                review.loadAll().catch(() => {});
              }}
            >
              Avis
            </button>
            <button style={styles.viewTab} onClick={() => ui.openModal("create_commerce")}>
              + Ajouter
            </button>
          </div>

          {/* Messages history */}
          {ui.messages.length > 0 && (
            <div style={styles.messages}>
              {ui.messages.slice(-5).map((m) => (
                <div
                  key={m.id}
                  style={m.role === "user" ? styles.msgUser : styles.msgSystem}
                >
                  {m.text}
                </div>
              ))}
            </div>
          )}

          {/* Main content area */}
          {view === "commerces" && (
            <CommerceList
              commerces={commerce.commerces}
              onAction={handleCommerceAction}
              searchQuery={searchQuery}
            />
          )}

          {view === "reviews" && (
            <ReviewList
              reviews={review.reviews}
              onSelectCommerce={(c) => ui.openModal("reviews", c)}
            />
          )}
        </div>
      </main>

      {/* PROMPT (Task 3 & 4) */}
      <ChatPrompt onSubmit={handleCommand} suggestions={suggestions} />

      {/* MODALS */}
      {ui.activeModal === "settings" && (
        <SettingsModal
          user={auth.user}
          onClose={ui.closeModal}
          onLogout={async () => { await auth.doLogout(); ui.closeModal(); }}
          theme={ui.theme}
          onThemeChange={ui.setTheme}
          onRefreshUser={auth.refreshUser}
        />
      )}

      {ui.activeModal === "profile" && (
        <ProfileModal user={auth.user} onClose={ui.closeModal} />
      )}

      {ui.activeModal === "create_commerce" && (
        <CommerceModal
          mode="create"
          categories={commerce.categories}
          types={commerce.types}
          onClose={ui.closeModal}
          onSuccess={() => commerce.loadAll()}
          addToast={addToast}
        />
      )}

      {ui.activeModal === "edit_commerce" && ui.modalData && (
        <CommerceModal
          mode="edit"
          commerce={ui.modalData}
          categories={commerce.categories}
          types={commerce.types}
          onClose={ui.closeModal}
          onSuccess={() => commerce.loadAll()}
          addToast={addToast}
        />
      )}

      {ui.activeModal === "view_commerce" && ui.modalData && (
        <ViewCommerceModal
          commerce={ui.modalData}
          onClose={ui.closeModal}
        />
      )}

      {ui.activeModal === "delete_commerce" && ui.modalData && (
        <DeleteConfirmModal
          commerce={ui.modalData}
          onClose={ui.closeModal}
          onDeleteSuccess={(id) => {
            commerce.removeCommerce(id);
            ui.closeModal();
          }}
          addToast={addToast}
        />
      )}

      {ui.activeModal === "reviews" && ui.modalData && (
        <ReviewModal
          commerce={ui.modalData}
          onClose={ui.closeModal}
          addToast={addToast}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "var(--bg, #f8fafc)",
    color: "var(--text, #222)",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "var(--bg, #f8fafc)",
    color: "var(--text, #222)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "var(--bg-card, #fff)",
    borderBottom: "1px solid var(--border, #e5e5e5)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "var(--accent, #2563eb)",
    cursor: "pointer",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid var(--border, #e5e5e5)",
    background: "var(--bg-input, #f9f9f9)",
    color: "var(--text, #555)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "var(--accent, #2563eb)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  main: {
    flex: 1,
    overflow: "auto",
    paddingBottom: 100,
  },
  content: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "16px 16px 0",
  },
  viewTabs: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  viewTab: {
    padding: "8px 16px",
    borderRadius: 20,
    border: "1px solid var(--border, #ddd)",
    background: "var(--bg-input, #f5f5f5)",
    color: "var(--text, #555)",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
  },
  viewTabActive: {
    padding: "8px 16px",
    borderRadius: 20,
    border: "1px solid var(--accent, #2563eb)",
    background: "var(--accent, #2563eb)",
    color: "#fff",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  messages: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  msgUser: {
    alignSelf: "flex-end",
    background: "var(--accent, #2563eb)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "16px 16px 4px 16px",
    fontSize: 13,
    maxWidth: "80%",
  },
  msgSystem: {
    alignSelf: "flex-start",
    background: "var(--bg-card, #fff)",
    color: "var(--text, #333)",
    padding: "8px 14px",
    borderRadius: "16px 16px 16px 4px",
    fontSize: 13,
    maxWidth: "80%",
    border: "1px solid var(--border, #e5e5e5)",
  },
};
