import requests

BASE_URL = "http://localhost:3000"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_update_existing_product():
    # Step 1: Create a new product first to update it later
    new_product_data = {
        "nome": "Test Pizza Update",
        "categoria_id": 1,
        "preco": 20.0,
        "descricao": "Pizza criada para teste de atualização"
    }
    created_product_id = None
    try:
        create_resp = requests.post(
            f"{BASE_URL}/api/products",
            headers=HEADERS,
            json=new_product_data,
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201, f"Expected 201 on product creation, got {create_resp.status_code}"
        product_created = create_resp.json()
        assert "id" in product_created, "Created product response missing 'id'"
        created_product_id = product_created["id"]

        # Step 2: Prepare updated product details
        updated_product_data = {
            "nome": "Test Pizza Updated",
            "categoria_id": 1,
            "preco": 25.5,
            "descricao": "Descrição atualizada da pizza para teste"
        }

        # Step 3: Update the created product
        update_resp = requests.put(
            f"{BASE_URL}/api/products/{created_product_id}",
            headers=HEADERS,
            json=updated_product_data,
            timeout=TIMEOUT,
        )
        assert update_resp.status_code == 200, f"Expected 200 on product update, got {update_resp.status_code}"

        # Step 4: Retrieve the updated product to verify changes
        get_resp = requests.get(
            f"{BASE_URL}/api/products",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert get_resp.status_code == 200, f"Expected 200 on get products, got {get_resp.status_code}"
        products_list = get_resp.json()

        # Find updated product in the list
        product = next((p for p in products_list if p.get("id") == created_product_id), None)
        assert product is not None, "Updated product not found in product list"
        assert product.get("nome") == updated_product_data["nome"], "Product name was not updated correctly"
        assert product.get("categoria_id") == updated_product_data["categoria_id"], "Product category was not updated correctly"
        assert abs(float(product.get("preco", 0)) - updated_product_data["preco"]) < 0.001, "Product price was not updated correctly"
        assert product.get("descricao") == updated_product_data["descricao"], "Product description was not updated correctly"

    finally:
        # Cleanup: Delete the created product to maintain test environment
        if created_product_id is not None:
            requests.delete(
                f"{BASE_URL}/api/products/{created_product_id}",
                headers=HEADERS,
                timeout=TIMEOUT,
            )


test_update_existing_product()
