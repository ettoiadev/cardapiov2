import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
AUTH = HTTPBasicAuth("admin@pizzaria.com", "admin123")
HEADERS = {"Content-Type": "application/json"}


def test_TC010_process_order_checkout():
    url = f"{BASE_URL}/api/checkout"
    payload = {
        "customer_info": {
            "name": "João Silva",
            "phone": "+5511999999999",
            "email": "joao.silva@example.com",
            "address": "Rua das Flores, 123, São Paulo, SP"
        },
        "payment_method": "cartão",
        "delivery_option": "delivery",
        "items": [
            {
                "product_id": 1,
                "quantity": 2,
                "customizations": {
                    "size": "M",
                    "flavor": "Margherita",
                    "additional_ingredients": ["bacon", "extra cheese"]
                }
            },
            {
                "product_id": 3,
                "quantity": 1,
                "customizations": {
                    "size": "G",
                    "flavor": "Calabresa",
                    "additional_ingredients": []
                }
            }
        ]
    }

    try:
        response = requests.post(url, auth=AUTH, headers=HEADERS, json=payload, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_response = response.json()
        assert "message" in json_response or "order_id" in json_response or "whatsapp" in json_response, \
            "Response missing expected keys indicating order processing"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"


test_TC010_process_order_checkout()