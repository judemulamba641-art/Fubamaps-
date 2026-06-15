/**
 * ChatPrompt FubaMaps.
 * Barre de commande inspiree de ChatGPT.
 * Route les commandes utilisateur vers les actions appropriees.
 */

import { useState, useRef } from "react";
import { useUI, MODALS, VIEWS } from "../store/uiStore";
import { useCommerce } from "../store/commerceStore";
import { smartSearch } from "../services/aiService";

// Systeme de commandes extensible
const COMMANDS = [
  { patterns: ["settings", "parametres", "param"], action: "open_settings", label: "Ouvrir parametres" },
  { patterns: ["ajouter commerce", "nouveau commerce", "creer commerce", "add commerce"], action: "create_commerce", label: "Creer un commerce" },
  { patterns: ["mes commerces", "liste", "commerces", "list"], action: "list_commerces", label: "Afficher les commerces" },
  { patterns: ["avis", "reviews", "review"], action: "open_reviews", label: "Gerer les avis" },
  { patterns: ["profil", "profile", "mon profil"], action: "open_profile", label: "Voir mon profil" },
  { patterns: ["deconnexion", "logout", "quitter"], action: "logout", label: "Se deconnecter" },
  { patterns: ["aide", "help", "commandes"], action: "show_help", label: "Afficher l'aide" },
];

export default function ChatPrompt({ onCommand }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const { openModal, switchView, addToHistory } = useUI();
  const { loadAll } = useCommerce();

  const matchCommand = (text) => {
    const lower = text.toLowerCase().trim();
    for (const cmd of COMMANDS) {
      for (const pattern of cmd.patterns) {
        if (lower.includes(pattern)) {
          return cmd;
        }
      }
    }
    return null;
  };

  const executeCommand = async (action, rawInput) => {
    addToHistory(rawInput);

    switch (action) {
      case "open_settings":
        openModal(MODALS.SETTINGS);
        break;
      case "create_commerce":
        openModal(MODALS.CREATE_COMMERCE);
        break;
      case "list_commerces":
        await loadAll();
        switchView(VIEWS.COMMERCE_LIST);
        break;
      case "open_reviews":
        switchView(VIEWS.REVIEWS);
        break;
      case "open_profile":
        openModal(MODALS.PROFILE);
        break;
      case "logout":
        openModal(MODALS.SETTINGS);
        break;
      case "show_help":
        if (onCommand) onCommand("help");
        break;
      default:
        // Recherche intelligente via IA service
        if (onCommand) onCommand("search", rawInput);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = matchCommand(input);
    if (cmd) {
      await executeCommand(cmd.action, input);
    } else {
      // Pas de commande reconnue -> recherche
      const searchData = await smartSearch(input);
      if (onCommand) onCommand("search", input, searchData);
    }

    setInput("");
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    // Suggestions en temps reel
    if (val.length >= 2) {
      const matched = COMMANDS.filter((cmd) =>
        cmd.patterns.some((p) => p.includes(val.toLowerCase()))
      );
      setSuggestions(matched.slice(0, 4));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (cmd) => {
    executeCommand(cmd.action, cmd.label);
    setInput("");
    setSuggestions([]);
  };

  return (
    <div className="chat-prompt-container">
      {suggestions.length > 0 && (
        <div className="suggestions-popup">
          {suggestions.map((cmd, i) => (
            <button
              key={i}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(cmd)}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="chat-prompt-form">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Tapez une commande ou recherchez... (ex: restaurant, settings, ajouter commerce)"
          className="chat-prompt-input"
        />
        <button type="submit" className="chat-prompt-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
