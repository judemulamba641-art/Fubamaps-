from unittest import TestCase

from apps.ai.prompts import (
    build_app_guide_prompt,
    build_chat_prompt,
    build_price_analysis_prompt,
    build_recommendation_prompt,
    build_safety_prompt,
    detect_intent,
)


class DetectIntentTests(TestCase):
    def test_price_intent(self):
        self.assertEqual(detect_intent("C'est cher ici"), "price")
        self.assertEqual(detect_intent("quel prix ?"), "price")

    def test_safety_intent(self):
        self.assertEqual(detect_intent("danger dans la zone"), "safety")
        self.assertEqual(detect_intent("question de sécurité"), "safety")

    def test_guide_intent(self):
        self.assertEqual(detect_intent("comment utiliser l'app"), "guide")
        self.assertEqual(detect_intent("j'ai besoin d'aide"), "guide")

    def test_recommendation_intent(self):
        self.assertEqual(detect_intent("recommande-moi un resto"), "recommendation")
        self.assertEqual(detect_intent("le meilleur commerce"), "recommendation")

    def test_chat_fallback(self):
        self.assertEqual(detect_intent("bonjour"), "chat")
        self.assertEqual(detect_intent("salut comment ça va"), "chat")

    def test_case_insensitive(self):
        self.assertEqual(detect_intent("PRIX élevé"), "price")
        self.assertEqual(detect_intent("DANGER"), "safety")


class BuildRecommendationPromptTests(TestCase):
    def test_includes_commerce_data(self):
        data = [
            {"name": "Resto A", "distance": 1.5, "rating": 4,
             "price": "Normal", "comment": "Bon"},
        ]
        prompt = build_recommendation_prompt(data)
        self.assertIn("Resto A", prompt)
        self.assertIn("1.5", prompt)
        self.assertIn("meilleure option", prompt)

    def test_multiple_commerces(self):
        data = [
            {"name": "A", "distance": 1, "rating": 4,
             "price": "Normal", "comment": "OK"},
            {"name": "B", "distance": 2, "rating": 5,
             "price": "Cher", "comment": "Super"},
        ]
        prompt = build_recommendation_prompt(data)
        self.assertIn("A", prompt)
        self.assertIn("B", prompt)


class BuildChatPromptTests(TestCase):
    def test_includes_user_message(self):
        prompt = build_chat_prompt("Bonjour")
        self.assertIn("Bonjour", prompt)

    def test_includes_commerces_data(self):
        data = [
            {"name": "X", "distance": 3, "rating": 4, "price": "Normal"},
        ]
        prompt = build_chat_prompt("test", commerces_data=data)
        self.assertIn("X", prompt)

    def test_includes_context(self):
        prompt = build_chat_prompt("test", context="previous context")
        self.assertIn("previous context", prompt)


class BuildAppGuidePromptTests(TestCase):
    def test_includes_user_message(self):
        prompt = build_app_guide_prompt("comment trouver un resto")
        self.assertIn("comment trouver un resto", prompt)
        self.assertIn("Fubamaps", prompt)


class BuildSafetyPromptTests(TestCase):
    def test_includes_data(self):
        data = [
            {"name": "Z", "rating": 2, "comment": "Mauvais"},
        ]
        prompt = build_safety_prompt(data)
        self.assertIn("Z", prompt)
        self.assertIn("risques", prompt)


class BuildPriceAnalysisPromptTests(TestCase):
    def test_includes_data(self):
        data = [
            {"name": "P", "price": "Cher", "rating": 3},
        ]
        prompt = build_price_analysis_prompt(data)
        self.assertIn("P", prompt)
        self.assertIn("qualité/prix", prompt)
