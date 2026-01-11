import pytest
import uuid

@pytest.mark.asyncio
async def test_register_super_admin(client, admin_token):
    # This might fail if seed already ran, so we use a random username
    unique_user = f"admin_{uuid.uuid4().hex[:6]}"
    response = await client.post(
        "/api/auth/register", 
        json={
            "username": unique_user,
            "password": "testpassword",
            "email": f"{unique_user}@test.com",
            "name": "Test Admin",
            "role": "SUPER_ADMIN"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == unique_user

@pytest.mark.asyncio
async def test_login(client):
    # Login with the seed admin or created admin
    response = await client.post("/api/auth/login", json={
        "username": "superadmin",
        "password": "superadmin123"
    })
    data = response.json()
    assert response.status_code == 200, f"Login failed: {data}"
    assert "access_token" in data, f"Access token missing: {data}"
    assert data["user"]["username"] == "superadmin"

@pytest.mark.asyncio
async def test_get_users_unauthorized(client):
    response = await client.get("/api/auth/users")
    assert response.status_code == 401
