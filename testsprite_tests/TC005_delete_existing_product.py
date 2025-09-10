import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_delete_existing_product():
    headers = {
        "Content-Type": "application/json"
    }

    # Create a category first to have a valid categoria_id
    category_data = {
        "nome": "Categoria Teste Para Produto"
    }
    category_id = None
    try:
        category_resp = requests.post(f"{BASE_URL}/api/categories", json=category_data, headers=headers, timeout=TIMEOUT)
        assert category_resp.status_code == 201, f"Expected 201 Created for category, got {category_resp.status_code}"
        category_created = category_resp.json()
        category_id = category_created.get("id") or category_created.get("categoria_id") or category_created.get("ID")
        assert category_id is not None, "No category ID returned after creation"

        product_data = {
            "nome": "Produto Teste Para Delecao",
            "categoria_id": category_id,
            "preco": 19.99,
            "descricao": "Produto criado para teste de exclusão"
        }

        product_id = None
        try:
            # Create a new product to delete
            create_resp = requests.post(f"{BASE_URL}/api/products", json=product_data, headers=headers, timeout=TIMEOUT)
            assert create_resp.status_code == 201, f"Expected 201 Created, got {create_resp.status_code}"
            product_created = create_resp.json()
            product_id = product_created.get("id") or product_created.get("product_id") or product_created.get("ID")
            assert product_id is not None, "No product ID returned after creation"

            # Delete the product
            delete_resp = requests.delete(f"{BASE_URL}/api/products/{product_id}", headers=headers, timeout=TIMEOUT)
            assert delete_resp.status_code == 200, f"Expected 200 OK on delete, got {delete_resp.status_code}"

            # Verify the product is deleted by trying to get it (assuming 404 means not found)
            get_resp = requests.get(f"{BASE_URL}/api/products/{product_id}", headers=headers, timeout=TIMEOUT)
            assert get_resp.status_code == 404, f"Expected 404 Not Found for deleted product, got {get_resp.status_code}"

        finally:
            # Cleanup: in case deletion failed, attempt delete
            if product_id is not None:
                requests.delete(f"{BASE_URL}/api/products/{product_id}", headers=headers, timeout=TIMEOUT)

    finally:
        if category_id is not None:
            requests.delete(f"{BASE_URL}/api/categories/{category_id}", headers=headers, timeout=TIMEOUT)


test_delete_existing_product()
