/**
 * Service IA - Abstractions pour integration future.
 * L'IA n'est pas encore implementee cote backend,
 * ce fichier prepare l'architecture extensible.
 */

/**
 * Analyse la commande utilisateur et retourne une intention.
 * V1 = regex simple. V2 = appel backend IA.
 */
export function parseCommand(input) {
  const text = input.trim().toLowerCase();

  const routes = [
    { pattern: /^(settings|parametres|param[eè]tres)$/i, action: "settings" },
    { pattern: /^(ajouter commerce|nouveau commerce|creer commerce|créer commerce)$/i, action: "create_commerce" },
    { pattern: /^(mes commerces|liste commerces|afficher commerces|commerces)$/i, action: "list_commerces" },
    { pattern: /^(avis|mes avis|afficher avis|gestion avis)$/i, action: "reviews" },
    { pattern: /^(profil|mon profil|profile)$/i, action: "profile" },
    { pattern: /^(deconnexion|logout|se deconnecter|déconnexion)$/i, action: "logout" },
    { pattern: /^(aide|help|comment)$/i, action: "help" },
    { pattern: /^(theme sombre|dark mode|mode sombre)$/i, action: "dark_mode" },
    { pattern: /^(theme clair|light mode|mode clair)$/i, action: "light_mode" },
  ];

  for (const route of routes) {
    if (route.pattern.test(text)) {
      return { type: "command", action: route.action };
    }
  }

  // Recherche par mots-cles flexibles
  if (text.includes("restaurant") || text.includes("pharmacie") || text.includes("hotel") || text.includes("proche")) {
    return { type: "search", query: text };
  }

  return { type: "unknown", query: text };
}

/**
 * Future: envoyer un message a l'IA backend.
 */
// eslint-disable-next-line no-unused-vars
export async function sendToAI(message, context = {}) {
  // Placeholder pour integration future
  return {
    response: `Commande "${message}" non reconnue. Essayez: settings, ajouter commerce, mes commerces, avis, profil.`,
    suggestions: ["mes commerces", "ajouter commerce", "avis", "settings"],
  };
}
