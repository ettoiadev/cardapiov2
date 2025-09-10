import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth('admin@pizzaria.com', 'admin123')
TIMEOUT = 30

def test_remove_item_from_cart():
    headers = {
        "Content-Type": "application/json"
    }

    # Step 1: Get list of products to find a product_id to add to cart
    product_id = None
    try:
        resp_products = requests.get(f"{BASE_URL}/api/products", auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert resp_products.status_code == 200, f"Failed to list products: {resp_products.status_code}"
        products = resp_products.json()
        assert isinstance(products, list) and len(products) > 0, "Products list is empty or invalid"
        product_id = products[0].get("id") if "id" in products[0] else products[0].get("product_id") if "product_id" in products[0] else None
        assert product_id is not None, "Product ID not found in product data"
    except Exception as e:
        raise AssertionError(f"Setup failed to get product ID: {e}")

    # Step 2: Add item to cart
    add_payload = {
        "product_id": product_id,
        "quantity": 1,
        "customizations": {}
    }
    try:
        resp_add = requests.post(f"{BASE_URL}/api/cart/add", json=add_payload, auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert resp_add.status_code == 200, f"Failed to add item to cart: {resp_add.status_code}"
    except Exception as e:
        raise AssertionError(f"Failed adding item to cart: {e}")

    # Step 3: Remove the item from cart
    remove_payload = {
        "product_id": product_id
    }
    try:
        resp_remove = requests.post(f"{BASE_URL}/api/cart/remove", json=remove_payload, auth=AUTH, headers=headers, timeout=TIMEOUT)
        assert resp_remove.status_code == 200, f"Failed to remove item from cart: {resp_remove.status_code}"
    except Exception as e:
        raise AssertionError(f"Failed removing item from cart: {e}")

    # Step 4: Verify cart is updated (Assuming GET /api/cart returns current cart)
    try:
        resp_cart = requests.get(f"{BASE_URL}/api/cart", auth=AUTH, headers=headers, timeout=TIMEOUT)
        # It is not explicitly in PRD but logically we verify cart state after removal.
        assert resp_cart.status_code == 200, f"Failed to get cart: {resp_cart.status_code}"
        cart = resp_cart.json()
        # Cart should not contain the product_id anymore
        if isinstance(cart, dict) and "items" in cart:
            items = cart["items"]
            assert all(item.get("product_id") != product_id for item in items), "Product still in cart after removal"
        else:
            # If structure unknown, assert cart is empty or no items
            assert (isinstance(cart, list) and all(i.get("product_id") != product_id for i in cart)) or not cart, "Product still present in cart"
    except Exception as e:
        raise AssertionError(f"Failed verifying cart update: {e}")

test_remove_item_from_cart()