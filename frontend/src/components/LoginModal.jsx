import { useState } from "react";

/**
 * Modal obligatoire d'authentification (Connexion + Inscription).
 * Bloque l'acces a l'application tant que l'utilisateur n'est pas connecte.
 */
export default function LoginModal({ onLogin, onRegister }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(loginForm.email, loginForm.password);
    } catch (err) {
      const msg =
        err?.detail || err?.email?.[0] || err?.password?.[0] || "Erreur de connexion";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (registerForm.password !== registerForm.password_confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await onRegister(registerForm);
    } catch (err) {
      const msg =
        err?.email?.[0] ||
        err?.password?.[0] ||
        err?.password_confirm?.[0] ||
        err?.detail ||
        "Erreur d'inscription";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.logo}>FubaMaps</h2>
        <p style={styles.subtitle}>Decouvrez les commerces autour de vous</p>

        <div style={styles.tabs}>
          <button
            style={tab === "login" ? styles.tabActive : styles.tab}
            onClick={() => { setTab("login"); setError(""); }}
          >
            Connexion
          </button>
          <button
            style={tab === "register" ? styles.tabActive : styles.tab}
            onClick={() => { setTab("register"); setError(""); }}
          >
            Inscription
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              style={styles.input}
              required
            />
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={styles.form}>
            <input
              type="text"
              placeholder="Prenom"
              value={registerForm.first_name}
              onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Nom"
              value={registerForm.last_name}
              onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Confirmer mot de passe"
              value={registerForm.password_confirm}
              onChange={(e) => setRegisterForm({ ...registerForm, password_confirm: e.target.value })}
              style={styles.input}
              required
            />
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "var(--bg-card, #fff)",
    color: "var(--text, #222)",
    borderRadius: 16,
    padding: "32px 28px",
    width: "90%",
    maxWidth: 400,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },
  logo: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    color: "var(--accent, #2563eb)",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "var(--text-muted, #666)",
    margin: "4px 0 20px",
  },
  tabs: {
    display: "flex",
    gap: 0,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid var(--border, #ddd)",
  },
  tab: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
    color: "var(--text-muted, #888)",
  },
  tabActive: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    background: "var(--accent, #2563eb)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid var(--border, #ddd)",
    fontSize: 14,
    background: "var(--bg-input, #f9f9f9)",
    color: "var(--text, #222)",
    outline: "none",
  },
  btn: {
    padding: "12px",
    borderRadius: 8,
    border: "none",
    background: "var(--accent, #2563eb)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 4,
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 8,
  },
};
