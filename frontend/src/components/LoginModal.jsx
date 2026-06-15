/**
 * Modal d'authentification obligatoire - FubaMaps.
 * Onglets Connexion / Inscription. Bloque l'accès sans auth.
 */

import { useState } from "react";
import { useAuth } from "../store/authStore";
import { useToast } from "./useToast";

export default function LoginModal() {
  const { login, register } = useAuth();
  const { addToast } = useToast();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      addToast("Connexion réussie", "success");
    } catch (err) {
      addToast(err.message || "Erreur connexion", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (regForm.password !== regForm.password_confirm) {
      addToast("Les mots de passe ne correspondent pas", "error");
      return;
    }
    setLoading(true);
    try {
      await register(regForm);
      addToast("Inscription réussie", "success");
    } catch (err) {
      addToast(err.message || "Erreur inscription", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={logoSection}>
          <h1 style={logoText}>FubaMaps</h1>
          <p style={subtitle}>Découvrez les meilleurs commerces</p>
        </div>

        <div style={tabBar}>
          <button
            style={tab === "login" ? tabActive : tabBtn}
            onClick={() => setTab("login")}
          >
            Connexion
          </button>
          <button
            style={tab === "register" ? tabActive : tabBtn}
            onClick={() => setTab("register")}
          >
            Inscription
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} style={formStyle}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              style={input}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              style={input}
              required
            />
            <button type="submit" style={submitBtn} disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={formStyle}>
            <div style={row}>
              <input
                placeholder="Prénom"
                value={regForm.first_name}
                onChange={(e) =>
                  setRegForm({ ...regForm, first_name: e.target.value })
                }
                style={{ ...input, flex: 1 }}
                required
              />
              <input
                placeholder="Nom"
                value={regForm.last_name}
                onChange={(e) =>
                  setRegForm({ ...regForm, last_name: e.target.value })
                }
                style={{ ...input, flex: 1 }}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={regForm.email}
              onChange={(e) =>
                setRegForm({ ...regForm, email: e.target.value })
              }
              style={input}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe (min 8 car.)"
              value={regForm.password}
              onChange={(e) =>
                setRegForm({ ...regForm, password: e.target.value })
              }
              style={input}
              required
              minLength={8}
            />
            <input
              type="password"
              placeholder="Confirmer mot de passe"
              value={regForm.password_confirm}
              onChange={(e) =>
                setRegForm({ ...regForm, password_confirm: e.target.value })
              }
              style={input}
              required
              minLength={8}
            />
            <button type="submit" style={submitBtn} disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  backdropFilter: "blur(4px)",
};

const modal = {
  background: "var(--bg-card, #fff)",
  color: "var(--text, #222)",
  borderRadius: 16,
  padding: "32px 28px",
  width: "min(420px, 92vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};

const logoSection = { textAlign: "center", marginBottom: 20 };
const logoText = { fontSize: 28, fontWeight: 800, color: "var(--accent, #2563eb)", margin: 0 };
const subtitle = { fontSize: 14, color: "var(--text-muted, #666)", margin: "4px 0 0" };

const tabBar = {
  display: "flex",
  gap: 0,
  marginBottom: 20,
  borderRadius: 8,
  overflow: "hidden",
  border: "1px solid var(--border, #ddd)",
};

const tabBtn = {
  flex: 1,
  padding: "10px 0",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  background: "transparent",
  color: "var(--text-muted, #666)",
  transition: "all 0.2s",
};

const tabActive = {
  ...tabBtn,
  background: "var(--accent, #2563eb)",
  color: "#fff",
};

const formStyle = { display: "flex", flexDirection: "column", gap: 12 };

const input = {
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid var(--border, #ddd)",
  fontSize: 14,
  background: "var(--bg-input, #f9f9f9)",
  color: "var(--text, #222)",
  outline: "none",
  transition: "border-color 0.2s",
  width: "100%",
  boxSizing: "border-box",
};

const row = { display: "flex", gap: 8 };

const submitBtn = {
  padding: "12px 0",
  borderRadius: 8,
  border: "none",
  background: "var(--accent, #2563eb)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  transition: "opacity 0.2s",
  marginTop: 4,
};
