import requests
from requests.auth import HTTPBasicAuth

def test_list_all_products():
    base_url = "http://localhost:3000"
    endpoint = "/api/products"
    url = base_url + endpoint
    auth = HTTPBasicAuth("admin@pizzaria.com", "admin123")
    headers = {
        "Accept": "application/json"
    }
    timeout = 30

    response = None
    try:
        response = requests.get(url, headers=headers, auth=auth, timeout=timeout)
        assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
        json_data = response.json()
        assert isinstance(json_data, list), "Response JSON is not a list"
        # Optionally check that each product has expected fields
        for product in json_data:
            assert isinstance(product, dict), "Product item is not a dictionary"
            # Check required fields based on PRD schema snippet for product
            assert "nome" in product, "Product missing 'nome'"
            assert "categoria_id" in product, "Product missing 'categoria_id'"
            assert "preco" in product, "Product missing 'preco'"
            assert "descricao" in product, "Product missing 'descricao'"
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Test failed: {e}")

test_list_all_products()