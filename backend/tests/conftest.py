import asyncio
import pytest
import os
from datetime import datetime
import unittest.mock as mock

# BRUTE FORCE PATCHING
import app.auth as auth_mod
auth_mod.verify_password = lambda x, y: True
auth_mod.create_access_token = lambda data: "mock-token"

# Fix imports in the router as well if they were already imported
try:
    import app.routers.auth as auth_router
    auth_router.verify_password = lambda x, y: True
    auth_router.create_access_token = lambda data: "mock-token"
except:
    pass

from app.main import app
from app.database import get_db
from app.routers.inventory import get_redis
from app.models import User, UserRole, Product
from httpx import AsyncClient, ASGITransport

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def mock_db():
    session = mock.AsyncMock()
    now = datetime.utcnow()
    
    test_user = User(
        id="test-uuid",
        username="superadmin",
        password="hashed_password",
        email="admin@test.com",
        name="Super Admin",
        role=UserRole.SUPER_ADMIN,
        created_at=now,
        updated_at=now,
        avatar=None,
        phone=None,
        pob=None,
        dob=None
    )
    
    test_product = Product(
        id="prod-uuid",
        sku="TEST-SKU",
        name="Test Product",
        category="Test Category",
        price=10.0,
        stock=100,
        min_stock=10,
        created_at=now,
        updated_at=now
    )
    
    async def mock_execute(query, *args, **kwargs):
        res = mock.Mock()
        res.scalars.return_value.first.return_value = test_user
        res.scalars.return_value.all.return_value = [test_product]
        return res

    session.execute = mock_execute
    session.commit = mock.AsyncMock()
    session.refresh = mock.AsyncMock()
    session.delete = mock.AsyncMock()
    session.add = mock.Mock()
    session.begin.return_value.__aenter__.return_value = session
    
    yield session

@pytest.fixture
async def client(mock_db):
    app.dependency_overrides[get_db] = lambda: mock_db
    
    # Mock get_redis dependency
    from app.routers.inventory import get_redis
    async def mock_get_redis():
        m = mock.AsyncMock()
        m.get.return_value = None
        m.setex.return_value = True
        return m
    app.dependency_overrides[get_redis] = mock_get_redis
    
    # Patch get_current_user globally
    with mock.patch("app.auth.get_current_user", return_value=User(id="test-uuid", username="superadmin", role=UserRole.SUPER_ADMIN, name="Super Admin")):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac
            
    app.dependency_overrides.clear()

@pytest.fixture
async def admin_token(client):
    response = await client.post("/api/auth/login", json={
        "username": "superadmin",
        "password": "superadmin123"
    })
    data = response.json()
    if "access_token" not in data:
        pytest.fail(f"Mock login failed with status {response.status_code}: {data}")
    return data["access_token"]
