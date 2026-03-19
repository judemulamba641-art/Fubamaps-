# =========================================================
# 🎯 SYSTEM PROMPT GLOBAL
# =========================================================

SYSTEM_PROMPT = """
Tu es Fubamaps AI, un assistant intelligent pour aider les utilisateurs en Afrique (Kinshasa).

Ton rôle :
- recommander des commerces
- analyser les avis
- guider l'utilisateur
- expliquer l'application

Contraintes :
- sois simple et clair
- utilise un ton naturel africain/français
- évite les longs textes
- donne des conseils utiles

Tu dois toujours prendre en compte :
- distance
- note
- prix
- sécurité (important)

Si tu n'as pas assez d'information, dis-le simplement.
"""


# =========================================================
# 📍 RECOMMANDATION CLASSIQUE
# =========================================================

def build_recommendation_prompt(commerces_data):
    prompt = """
Analyse ces commerces et donne une recommandation claire.

Critères importants :
- distance
- note
- prix
- qualité des avis
- sécurité si possible

Réponds en 2-3 phrases maximum.
"""

    for c in commerces_data:
        prompt += f"""
Nom: {c['name']}
Distance: {c['distance']} km
Note: {c['rating']}
Prix: {c['price']}
Avis: {c['comment']}
"""

    prompt += "\nQuelle est la meilleure option et pourquoi ?"

    return prompt


# =========================================================
# 💬 CONVERSATION INTELLIGENTE
# =========================================================

def build_chat_prompt(user_message, commerces_data=None, context=None):
    """
    Permet une conversation naturelle avec l'utilisateur
    """

    prompt = f"""
Utilisateur : {user_message}

Tu dois :
- comprendre la demande
- répondre comme un guide local intelligent
- proposer des commerces si nécessaire
- poser une question si c'est utile
"""

    # Ajouter contexte commerces si dispo
    if commerces_data:
        prompt += "\nVoici des commerces disponibles :\n"

        for c in commerces_data:
            prompt += f"""
Nom: {c['name']}
Distance: {c['distance']} km
Note: {c['rating']}
Prix: {c['price']}
"""

    # Ajouter contexte conversation
    if context:
        prompt += f"\nContexte précédent : {context}\n"

    prompt += """
Réponds de manière naturelle et utile.
"""

    return prompt


# =========================================================
# 🧭 GUIDE UTILISATEUR (APP)
# =========================================================

def build_app_guide_prompt(user_message):
    """
    Guide l'utilisateur dans l'utilisation de l'application
    """

    return f"""
Utilisateur : {user_message}

Tu es un assistant qui aide à utiliser Fubamaps.

Explique simplement :
- comment trouver un commerce
- comment voir les avis
- comment ajouter un avis
- comment utiliser la carte

Donne des étapes simples et pratiques.
"""


# =========================================================
# 🚨 SÉCURITÉ
# =========================================================

def build_safety_prompt(commerces_data):
    """
    Analyse sécurité basée sur avis
    """

    prompt = """
Analyse les commerces suivants et identifie les risques possibles :

Critères :
- mauvais avis
- plaintes
- danger potentiel

Réponds clairement :
- commerces fiables
- commerces à éviter
"""

    for c in commerces_data:
        prompt += f"""
Nom: {c['name']}
Note: {c['rating']}
Avis: {c['comment']}
"""

    return prompt


# =========================================================
# 💰 ANALYSE PRIX
# =========================================================

def build_price_analysis_prompt(commerces_data):
    prompt = """
Compare ces commerces selon le rapport qualité/prix.

Explique :
- lequel est le moins cher
- lequel est le meilleur rapport qualité/prix
"""

    for c in commerces_data:
        prompt += f"""
Nom: {c['name']}
Prix: {c['price']}
Note: {c['rating']}
"""

    return prompt


# =========================================================
# 🧠 ROUTEUR INTELLIGENT
# =========================================================

def detect_intent(user_message):
    """
    Détecte l'intention utilisateur (simple V1)
    """

    msg = user_message.lower()

    if "prix" in msg or "cher" in msg:
        return "price"

    if "danger" in msg or "sécurité" in msg:
        return "safety"

    if "comment utiliser" in msg or "aide" in msg:
        return "guide"

    if "recommande" in msg or "meilleur" in msg:
        return "recommendation"

    return "chat"