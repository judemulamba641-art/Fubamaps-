import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"


def print_response(label, response):
    try:
        result = response.json()
    except Exception:
        result = response.text

    print(f"\n{label} (HTTP {response.status_code})")
    print(json.dumps(result, indent=2, ensure_ascii=False) if isinstance(result, (dict, list)) else result)


# =========================================================
# 🏪 CREATE COMMERCE
# =========================================================

def create_commerce():
    url = f"{BASE_URL}/commerces/"
    print("URL create commerce:", url)
    data = {
        "name": "Test Restaurant Kin",
        "latitude": -4.325,
        "longitude": 15.322,
        "description": "Restaurant test",
        "category": 1,
        "type": 1
    }
    response = requests.post(url, json=data)
    print_response("CREATE COMMERCE", response)
    if response.status_code not in (200, 201):
        raise RuntimeError(f"CREATE COMMERCE failed: {response.status_code}")
    return response.json()


# =========================================================
# ⭐ CREATE AVIS
# =========================================================

def create_avis(commerce_id):
    url = f"{BASE_URL}/avis/"
    data = {
        "commerce": commerce_id,
        "note": 4,
        "price_rating": 3,
        "commentaire": "Bon mais un peu cher",
        "user_name": "TestUser"
    }
    response = requests.post(url, json=data)
    print_response("CREATE AVIS", response)
    if response.status_code not in (200, 201):
        raise RuntimeError(f"CREATE AVIS failed: {response.status_code}")


# =========================================================
# 📍 GET NEARBY
# =========================================================

def get_nearby():
    url = f"{BASE_URL}/commerces/nearby/?lat=-4.325&lng=15.322"
    response = requests.get(url)
    print_response("NEARBY COMMERCES", response)


# =========================================================
# 🤖 AI RECOMMENDATION
# =========================================================

def get_ai():
    url = f"{BASE_URL}/ai/recommendation/?lat=-4.325&lng=15.322"
    response = requests.get(url)
    print_response("AI RESPONSE", response)


# =========================================================
# 💬 AI CHAT
# =========================================================

def ai_chat():
    url = f"{BASE_URL}/ai/chat/"
    data = {
        "message": "Je cherche un restaurant pas cher près de moi"
    }
    response = requests.post(url, json=data)
    print_response("AI CHAT", response)


# =========================================================
# 🚀 RUN ALL TESTS
# =========================================================

def run_tests():
    print("\n🚀 START TEST RUNNER\n")
    commerce = create_commerce()

    if commerce and isinstance(commerce, dict) and commerce.get("id"):
        create_avis(commerce["id"])

    get_nearby()

    # l'API AI n'est pas activée dans config/urls.py (commenté), ne pas bloquer si 404
    try:
        get_ai()
    except Exception as e:
        print("AI recommendation failed, continue:", e)

    try:
        ai_chat()
    except Exception as e:
        print("AI chat failed, continue:", e)

    print("\n✅ TESTS TERMINÉS\n")


# =========================================================

if __name__ == "__main__":
    run_tests()
