import pytest

@pytest.mark.asyncio
async def test_get_products(client, admin_token):
    response = await client.get(
        "/api/inventory/",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_product(client, auth_token):
    sku = "TEST-SKU-001"
    response = await client.post(
        "/api/inventory/",
        json={
            "sku": sku,
            "name": "Test Product",
            "category": "Testing",
            "price": 99.99,
            "stock": 10,
            "min_stock": 5
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert response.json()["sku"] == sku

@pytest.mark.asyncio
async def test_adjust_stock(client, auth_token):
    # First create a product
    prod_res = await client.post(
        "/api/inventory/",
        json={"sku": "ADJ-001", "name": "Adj Prod", "category": "Test", "price": 10, "stock": 10},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    product_id = prod_res.json()["id"]
    
    # Adjust stock
    adj_res = await client.post(
        "/api/transactions/adjust",
        json={"productId": product_id, "type": "OUT", "quantity": 5},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert adj_res.status_code == 200
    assert adj_res.json()["quantity"] == 5
    
    # Verify stock decreased
    prod_check = await client.get(
        "/api/inventory/",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    prod = next(p for p in prod_check.json() if p["id"] == product_id)
    assert prod["stock"] == 5
