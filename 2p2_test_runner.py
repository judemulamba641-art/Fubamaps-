import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"


# =========================================================
# 🏪 CREATE COMMERCE
# =========================================================

def create_commerce():
    url = f"{BASE_URL}/commerces/"
    data = {
        "name": "Test Restaurant Kin",
        "latitude": -4.325,
        "longitude": 15.322,
        "description": "Restaurant test",
        "category": 1,
        "type": 1
    }
    response = requests.post(url, json=data)
    print("\n✅ CREATE COMMERCE:", response.json())
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
                                                                                                                                    print("\n⭐ CREATE AVIS:", response.json())


                                                                                                                                    # =========================================================
                                                                                                                                    # 📍 GET NEARBY
                                                                                                                                    # =========================================================

                                                                                                                                    def get_nearby():
                                                                                                                                        url = f"{BASE_URL}/commerces/nearby/?lat=-4.325&lng=15.322"

                                                                                                                                            response = requests.get(url)
                                                                                                                                                data = response.json()

                                                                                                                                                    print("\n📍 NEARBY COMMERCES:")
                                                                                                                                                        print(json.dumps(data, indent=2))

                                                                                                                                                            return data


                                                                                                                                                            # =========================================================
                                                                                                                                                            # 🤖 AI RECOMMENDATION
                                                                                                                                                            # =========================================================

                                                                                                                                                            def get_ai():
                                                                                                                                                                url = f"{BASE_URL}/ai/recommendation/?lat=-4.325&lng=15.322"

                                                                                                                                                                    response = requests.get(url)

                                                                                                                                                                        print("\n🤖 AI RESPONSE:")
                                                                                                                                                                            print(response.json())


                                                                                                                                                                            # =========================================================
                                                                                                                                                                            # 💬 AI CHAT
                                                                                                                                                                            # =========================================================

                                                                                                                                                                            def ai_chat():
                                                                                                                                                                                url = f"{BASE_URL}/ai/chat/"

                                                                                                                                                                                    data = {
                                                                                                                                                                                            "message": "Je cherche un restaurant pas cher près de moi"
                                                                                                                                                                                                }

                                                                                                                                                                                                    response = requests.post(url, json=data)

                                                                                                                                                                                                        print("\n💬 AI CHAT:")
                                                                                                                                                                                                            print(response.json())


                                                                                                                                                                                                            # =========================================================
                                                                                                                                                                                                            # 🚀 RUN ALL TESTS
                                                                                                                                                                                                            # =========================================================

                                                                                                                                                                                                            def run_tests():
                                                                                                                                                                                                                print("\n🚀 START TEST RUNNER\n")

                                                                                                                                                                                                                    commerce = create_commerce()

                                                                                                                                                                                                                        if "id" in commerce:
                                                                                                                                                                                                                                create_avis(commerce["id"])

                                                                                                                                                                                                                                    get_nearby()
                                                                                                                                                                                                                                        get_ai()
                                                                                                                                                                                                                                            ai_chat()

                                                                                                                                                                                                                                                print("\n✅ TESTS TERMINÉS\n")


                                                                                                                                                                                                                                                # =========================================================

                                                                                                                                                                                                                                                if __name__ == "__main__":
                                                                                                                                                                                                                                                    run_tests()