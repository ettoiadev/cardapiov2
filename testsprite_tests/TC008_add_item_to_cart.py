import requests

BASE_URL = "http://localhost:3000"
HEADERS = {
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_add_item_to_cart():
    product_id = None
    # Step 1: Create a product to add to the cart (since no product_id provided)
    create_product_payload = {
        "nome": "Test Pizza Margherita",
        "categoria_id": 1,  # Assuming category 1 exists; otherwise would need to create category
        "preco": 25.00,
        "descricao": "Delicious cheese pizza for testing"
    }
    try:
        # Create product
        create_product_resp = requests.post(
            f"{BASE_URL}/api/products",
            json=create_product_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_product_resp.status_code == 201, f"Product creation failed: {create_product_resp.text}"
        product_data = create_product_resp.json()
        product_id = product_data.get("id")
        assert product_id is not None, "Created product response missing 'id'"

        # Step 2: Add item to cart
        add_to_cart_payload = {
            "product_id": product_id,
            "quantity": 2,
            "customizations": {
                "tamanho": "Médio",
                "adicionais": ["Borda recheada", "Extra queijo"],
                "sabores": ["Margherita", "Calabresa"]
            }
        }
        add_to_cart_resp = requests.post(
            f"{BASE_URL}/api/cart/add",
            json=add_to_cart_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert add_to_cart_resp.status_code == 200, f"Add to cart failed: {add_to_cart_resp.text}"
        add_to_cart_data = add_to_cart_resp.json()
        assert isinstance(add_to_cart_data, dict), "Add to cart response not a JSON object"

    finally:
        # Cleanup: delete the created product if it was created
        if product_id is not None:
            delete_resp = requests.delete(
                f"{BASE_URL}/api/products/{product_id}",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            assert delete_resp.status_code == 200, f"Failed to delete product in cleanup: {delete_resp.text}"

test_add_item_to_cart()
