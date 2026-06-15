/**
 * Service IA FubaMaps (preparation future).
 * Abstractions pour assistant IA, recherche intelligente et suggestions.
 * L'implementation reelle sera ajoutee ulterieurement.
 */

// --- Interface IA (a implementer avec backend OpenAI) ---

/**
 * Envoie une requete en langage naturel a l'assistant IA.
 * Pour l'instant, retourne une reponse locale basee sur le routeur de commandes.
 * @param {string} query - Question ou commande de l'utilisateur
 * @param {object} context - Contexte (localisation, historique, etc.)
 * @returns {Promise<{type: string, data: any, message: string}>}
 */
export async function askAssistant(query) {
  // Future: appel API vers /api/ai/ask/
  // Pour maintenant, on retourne un objet avec des suggestions locales
  return {
    type: "local",
    data: null,
    message: `Fonctionnalite IA en preparation. Votre requete: "${query}"`,
    suggestions: getSuggestions(query),
  };
}

/**
 * Recherche intelligente de commerces basee sur le langage naturel.
 * @param {string} query - Recherche en texte libre
 * @param {object} location - {lat, lng} position de l'utilisateur
 * @returns {Promise<Array>}
 */
export async function smartSearch(query, location = null) {
  // Future: appel API vers /api/ai/search/
  // Pour maintenant, on extrait les mots-cles pour la recherche classique
  const keywords = extractKeywords(query);
  return { keywords, location, raw: query };
}

/**
 * Obtient des suggestions de commerces basees sur le contexte.
 * @param {object} context - {location, history, preferences}
 * @returns {Promise<Array>}
 */
export async function getSuggestionsByContext() {
  // Future: appel API vers /api/ai/suggest/
  return [];
}

// --- Utilitaires internes ---

function extractKeywords(query) {
  const stopWords = new Set([
    "le", "la", "les", "un", "une", "des", "du", "de",
    "a", "au", "aux", "en", "et", "ou", "je", "tu",
    "il", "elle", "nous", "vous", "ils", "elles",
    "mon", "ma", "mes", "ton", "ta", "tes",
    "son", "sa", "ses", "notre", "votre", "leur",
    "qui", "que", "quoi", "dont", "ou",
    "cherche", "trouve", "affiche", "montre", "ouvre",
    "proche", "pres", "ici", "moi",
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

function getSuggestions(query) {
  const lower = query.toLowerCase();
  const suggestions = [];

  if (lower.includes("restaurant") || lower.includes("manger")) {
    suggestions.push("Rechercher des restaurants");
  }
  if (lower.includes("pharmacie") || lower.includes("medicament")) {
    suggestions.push("Rechercher des pharmacies");
  }
  if (lower.includes("hotel") || lower.includes("dormir")) {
    suggestions.push("Rechercher des hotels");
  }

  return suggestions;
}

// --- Constantes pour futurs prompts IA ---

export const AI_CAPABILITIES = {
  SEARCH: "search",
  SUGGEST: "suggest",
  ASK: "ask",
  NAVIGATE: "navigate",
};

export const AI_STATUS = {
  READY: "ready",
  PROCESSING: "processing",
  ERROR: "error",
  DISABLED: "disabled",
};
