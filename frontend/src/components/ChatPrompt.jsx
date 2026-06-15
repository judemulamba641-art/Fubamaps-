/**
 * Prompt ChatGPT-style - FubaMaps.
 * Barre de commande en bas de page.
 * Routeur de commandes extensible pour future IA.
 */

import { useState } from "react";

export default function ChatPrompt({ onCommand }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onCommand(text);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} style={container}>
      <div style={inputWrapper}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez une commande... (ex: settings, ajouter commerce, mes commerces)"
          style={inputStyle}
        />
        <button type="submit" style={sendBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
          </svg>
        </button>
      </div>
      <div style={hints}>
        <span style={hint} onClick={() => onCommand("mes commerces")}>mes commerces</span>
        <span style={hint} onClick={() => onCommand("ajouter commerce")}>ajouter commerce</span>
        <span style={hint} onClick={() => onCommand("settings")}>settings</span>
        <span style={hint} onClick={() => onCommand("profil")}>profil</span>
      </div>
    </form>
  );
}

const container = {
  padding: "12px 20px 16px",
  borderTop: "1px solid var(--border, #e5e7eb)",
  background: "var(--bg-surface, #fafafa)",
};

const inputWrapper = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  background: "var(--bg-card, #fff)",
  border: "1px solid var(--border, #ddd)",
  borderRadius: 12,
  padding: "6px 8px 6px 16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const inputStyle = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: 14,
  background: "transparent",
  color: "var(--text, #222)",
  padding: "8px 0",
};

const sendBtn = {
  background: "var(--accent, #2563eb)",
  border: "none",
  borderRadius: 8,
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#fff",
  flexShrink: 0,
};

const hints = {
  display: "flex",
  gap: 8,
  marginTop: 8,
  flexWrap: "wrap",
  justifyContent: "center",
};

const hint = {
  padding: "4px 12px",
  borderRadius: 16,
  border: "1px solid var(--border, #ddd)",
  fontSize: 12,
  color: "var(--text-muted, #666)",
  cursor: "pointer",
  transition: "all 0.15s",
  background: "transparent",
};
