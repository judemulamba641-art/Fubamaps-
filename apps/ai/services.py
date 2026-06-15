import logging
import os

from openai import OpenAI, OpenAIError

from .prompts import (
    SYSTEM_PROMPT,
    build_recommendation_prompt,
    build_chat_prompt,
    build_app_guide_prompt,
    build_safety_prompt,
    build_price_analysis_prompt,
    detect_intent,
)

logger = logging.getLogger(__name__)

# =========================================================
# 🔐 INIT OPENAI
# =========================================================

_api_key = os.getenv("OPENAI_API_KEY")
if not _api_key:
    logger.warning("OPENAI_API_KEY is not set — AI features will be unavailable.")

client = OpenAI(api_key=_api_key) if _api_key else None


# =========================================================
# 📊 PRÉPARATION DES DONNÉES
# =========================================================


def prepare_commerce_data(commerces):
    """
    Transforme les objets Commerce en données simples pour IA
    """

    data = []

    for c in commerces:
        review = c.avis.filter(is_active=True).first()

        data.append(
            {
                "name": c.name,
                "distance": getattr(c, "distance", "N/A"),
                "rating": getattr(c, "average_rating", 0),
                "price": review.get_price_rating_display() if review else "Non précisé",
                "comment": (
                    review.commentaire[:120]
                    if review and review.commentaire
                    else "Pas d'avis"
                ),
            }
        )

    return data


# =========================================================
# 🤖 APPEL OPENAI (CENTRAL)
# =========================================================


def call_openai(prompt, temperature=0.6, max_tokens=180):
    """
    Appel sécurisé et optimisé à OpenAI.
    Raises OpenAIError on failure so callers can decide how to handle it.
    """

    if not _api_key or client is None:
        logger.error("OpenAI call attempted without a configured API key.")
        raise OpenAIError("OPENAI_API_KEY is not configured.")

    try:
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content.strip()

    except OpenAIError:
        logger.exception("OpenAI API call failed.")
        raise


# =========================================================
# 🧠 ROUTEUR PRINCIPAL IA
# =========================================================


def generate_ai_response(user_message, commerces=None, context=None):
    """
    Fonction principale utilisée par ton API.

    Returns the AI response string, or a fallback message if the AI service
    is unavailable.
    """

    intent = detect_intent(user_message)

    commerces_data = prepare_commerce_data(commerces) if commerces else None

    if intent == "recommendation":
        prompt = build_recommendation_prompt(commerces_data)

    elif intent == "price":
        prompt = build_price_analysis_prompt(commerces_data)

    elif intent == "safety":
        prompt = build_safety_prompt(commerces_data)

    elif intent == "guide":
        prompt = build_app_guide_prompt(user_message)

    else:
        prompt = build_chat_prompt(
            user_message=user_message, commerces_data=commerces_data, context=context
        )

    try:
        return call_openai(prompt)
    except OpenAIError:
        return "Je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants."


# =========================================================
# 📍 RÉPONSE RAPIDE (SANS CHAT)
# =========================================================


def get_ai_recommendation(commerces):
    """
    Version simple (endpoint rapide).
    Returns a fallback message when the AI service is unavailable.
    """

    if not commerces:
        return "Aucun commerce trouvé autour de toi."

    commerces_data = prepare_commerce_data(commerces)
    prompt = build_recommendation_prompt(commerces_data)

    try:
        return call_openai(prompt, temperature=0.5, max_tokens=120)
    except OpenAIError:
        return "Je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants."


# =========================================================
# 💬 MODE CHAT CONTINU (FUTUR)
# =========================================================


def generate_chat_response(user_message, commerces=None, previous_messages=None):
    """
    Permet une vraie conversation type ChatGPT.
    Returns a fallback message when the AI service is unavailable.
    """

    if not _api_key or client is None:
        logger.error("Chat response attempted without a configured API key.")
        return "Je rencontre un problème pour répondre. Réessaie."

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if previous_messages:
        messages.extend(previous_messages)

    if commerces:
        commerces_data = prepare_commerce_data(commerces)
        context_text = f"Commerces disponibles: {commerces_data}"
        messages.append({"role": "system", "content": context_text})

    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=200,
        )

        return response.choices[0].message.content.strip()

    except OpenAIError:
        logger.exception("OpenAI chat completion failed.")
        return "Je rencontre un problème pour répondre. Réessaie."
