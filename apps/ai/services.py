import os
from openai import OpenAI

from apps.avis.models import Avis
from .prompts import (
    SYSTEM_PROMPT,
    build_recommendation_prompt,
    build_chat_prompt,
    build_app_guide_prompt,
    build_safety_prompt,
    build_price_analysis_prompt,
    detect_intent,
)


# =========================================================
# 🔐 INIT OPENAI
# =========================================================

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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

        data.append({
            "name": c.name,
            "distance": getattr(c, "distance", "N/A"),
            "rating": getattr(c, "average_rating", 0),
            "price": review.get_price_rating_display() if review else "Non précisé",
            "comment": (review.commentaire[:120] if review and review.commentaire else "Pas d’avis"),
        })

    return data


# =========================================================
# 🤖 APPEL OPENAI (CENTRAL)
# =========================================================

def call_openai(prompt, temperature=0.6, max_tokens=180):
    """
    Appel sécurisé et optimisé à OpenAI
    """

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

    except Exception:
        return "Je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants."


# =========================================================
# 🧠 ROUTEUR PRINCIPAL IA
# =========================================================

def generate_ai_response(user_message, commerces=None, context=None):
    """
    Fonction principale utilisée par ton API

    - détecte l’intention
    - choisit le bon prompt
    - appelle OpenAI
    """

    intent = detect_intent(user_message)

    commerces_data = prepare_commerce_data(commerces) if commerces else None

    # 🎯 ROUTAGE INTELLIGENT
    if intent == "recommendation":
        prompt = build_recommendation_prompt(commerces_data)

    elif intent == "price":
        prompt = build_price_analysis_prompt(commerces_data)

    elif intent == "safety":
        prompt = build_safety_prompt(commerces_data)

    elif intent == "guide":
        prompt = build_app_guide_prompt(user_message)

    else:
        # 💬 conversation naturelle
        prompt = build_chat_prompt(
            user_message=user_message,
            commerces_data=commerces_data,
            context=context
        )

    return call_openai(prompt)


# =========================================================
# 📍 RÉPONSE RAPIDE (SANS CHAT)
# =========================================================

def get_ai_recommendation(commerces):
    """
    Version simple (endpoint rapide)
    """

    if not commerces:
        return "Aucun commerce trouvé autour de toi."

    commerces_data = prepare_commerce_data(commerces)
    prompt = build_recommendation_prompt(commerces_data)

    return call_openai(prompt, temperature=0.5, max_tokens=120)


# =========================================================
# 💬 MODE CHAT CONTINU (FUTUR)
# =========================================================

def generate_chat_response(user_message, commerces=None, previous_messages=None):
    """
    Permet une vraie conversation type ChatGPT
    """

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # historique conversation
    if previous_messages:
        messages.extend(previous_messages)

    # ajout contexte commerces
    if commerces:
        commerces_data = prepare_commerce_data(commerces)
        context_text = f"Commerces disponibles: {commerces_data}"
        messages.append({"role": "system", "content": context_text})

    # message utilisateur
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=200,
        )

        return response.choices[0].message.content.strip()

    except Exception:
        return "Je rencontre un problème pour répondre. Réessaie."