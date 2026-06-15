import { useState } from "react";

/**
 * Barre de commande (prompt) style ChatGPT.
 * Toujours visible en bas de l'ecran.
 */
export default function ChatPrompt({ onSubmit, suggestions }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input.trim());
    setInput("");
  };

  const handleSuggestion = (s) => {
    onSubmit(s);
  };

  return (
    <div style={styles.wrapper}>
      {suggestions && suggestions.length > 0 && (
        <div style={styles.suggestions}>
          {suggestions.map((s) => (
            <button key={s} style={styles.chip} onClick={() => handleSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez une commande... (ex: mes commerces, avis, settings)"
          style={styles.input}
        />
        <button type="submit" style={styles.btn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "var(--bg-card, #fff)",
    borderTop: "1px solid var(--border, #e5e5e5)",
    padding: "8px 16px 12px",
    zIndex: 100,
  },
  suggestions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
    justifyContent: "center",
  },
  chip: {
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid var(--border, #ddd)",
    background: "var(--bg-input, #f5f5f5)",
    color: "var(--text, #333)",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  form: {
    display: "flex",
    gap: 8,
    maxWidth: 680,
    margin: "0 auto",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 24,
    border: "1px solid var(--border, #ddd)",
    fontSize: 14,
    background: "var(--bg-input, #f9f9f9)",
    color: "var(--text, #222)",
    outline: "none",
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "var(--accent, #2563eb)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};
