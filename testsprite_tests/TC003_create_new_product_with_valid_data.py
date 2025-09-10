import requests

BASE_URL = "http://localhost:3000"
USERNAME = "admin@pizzaria.com"
PASSWORD = "admin123"
TIMEOUT = 30


def get_auth_cookies():
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {"email": USERNAME, "password": PASSWORD}
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Login failed with status code {response.status_code}"
        return response.cookies
    except requests.exceptions.RequestException as e:
        assert False, f"Login request failed: {e}"


def test_create_new_product_with_valid_data():
    cookies = get_auth_cookies()
    url = f"{BASE_URL}/api/products"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "nome": "Pizza Margherita",
        "categoria_id": 1,
        "preco": 29.90,
        "descricao": "Pizza tradicional com molho de tomate, mussarela e manjericão"
    }
    response = None
    product_id = None

    try:
        response = requests.post(url, json=payload, headers=headers, cookies=cookies, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected status code 201 but got {response.status_code}"
        json_response = response.json()
        # Assuming that the API returns the created product object including its ID
        assert "id" in json_response, "Response JSON does not contain 'id' of created product"
        product_id = json_response["id"]
        assert json_response.get("nome") == payload["nome"], "Product name does not match"
        assert json_response.get("categoria_id") == payload["categoria_id"], "Category ID does not match"
        assert float(json_response.get("preco", 0)) == payload["preco"], "Product price does not match"
        assert json_response.get("descricao") == payload["descricao"], "Product description does not match"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"
    finally:
        # Clean up: delete the created product if created
        if product_id is not None:
            try:
                delete_url = f"{BASE_URL}/api/products/{product_id}"
                del_response = requests.delete(delete_url, cookies=cookies, timeout=TIMEOUT)
                assert del_response.status_code == 200 or del_response.status_code == 204, f"Failed to delete product with id {product_id}, status code: {del_response.status_code}"
            except requests.exceptions.RequestException:
                pass


test_create_new_product_with_valid_data()
