import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
TIMEOUT = 30
USERNAME = "admin@pizzaria.com"
PASSWORD = "admin123"

def test_list_all_categories():
    url = f"{BASE_URL}/api/categories"
    try:
        response = requests.get(url, auth=HTTPBasicAuth(USERNAME, PASSWORD), timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        categories = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(categories, list), "Response JSON is not a list"
    for category in categories:
        assert isinstance(category, dict), "Category item is not a JSON object"
        assert "nome" in category or "descricao" in category or len(category) > 0, "Category item missing expected fields"

test_list_all_categories()