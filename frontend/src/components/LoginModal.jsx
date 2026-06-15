/**
 * Modal d'authentification FubaMaps.
 * Affiche les onglets Connexion et Inscription.
 * Obligatoire si l'utilisateur n'est pas connecte.
 */

import { useState } from "react";
import { useAuth } from "../store/authStore";

export default function LoginModal() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (regPassword !== regPasswordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const parts = regName.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      await register(firstName, lastName, regEmail, regPassword, regPasswordConfirm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay modal-mandatory">
      <div className="modal-content auth-modal">
        <div className="auth-header">
          <h2>FubaMaps</h2>
          <p>Decouvrez les commerces autour de vous</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => { setTab("login"); setError(""); }}
          >
            Connexion
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => { setTab("register"); setError(""); }}
          >
            Inscription
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="reg-name">Nom complet</label>
              <input
                id="reg-name"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Prenom Nom"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Mot de passe</label>
              <input
                id="reg-password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Min. 8 caracteres"
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password-confirm">Confirmer le mot de passe</label>
              <input
                id="reg-password-confirm"
                type="password"
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
                placeholder="Confirmez le mot de passe"
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
