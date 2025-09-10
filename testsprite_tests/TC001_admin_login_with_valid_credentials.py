import requests

def test_admin_login_with_valid_credentials():
    base_url = "http://localhost:3000"
    endpoint = "/api/auth/login"
    url = base_url + endpoint
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "email": "admin@pizzaria.com",
        "password": "admin123"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        # Assert status code 200 for successful login
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        # Additional checks could be presence of session token or similar
        response_json = response.json()
        # Example: check that a token or session key exists in response if applicable
        assert isinstance(response_json, dict), "Response is not a JSON object"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_admin_login_with_valid_credentials()