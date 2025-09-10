import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_create_new_category():
    url = f"{BASE_URL}/api/categories"
    headers = {"Content-Type": "application/json"}
    payload = {
        "nome": "Categoria Teste",
        "descricao": "Descrição da Categoria Teste"
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request to create category failed: {str(e)}"

    assert response.status_code == 201, f"Expected status 201, got {response.status_code}"


test_create_new_category()
