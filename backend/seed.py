import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session_maker, get_engine
from app.models import Base, User, Product, UserRole
from app.auth import get_password_hash

from sqlalchemy.future import select

SUPER_ADMIN_ID = "c636003c-ee51-4740-a35d-ba13ebf99105"

async def run_seed():
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = get_session_maker()
    async with AsyncSessionLocal() as db:
        # Check if admin already exists by fixed ID
        admin = await db.get(User, SUPER_ADMIN_ID)
        if admin:
            print("Super Admin already exists. Skipping seed.")
            return

        hashed_password = get_password_hash("superadmin123")
        
        # Create Super Admin
        admin = User(
            id=SUPER_ADMIN_ID,
            username="superadmin",
            password=hashed_password,
            email="admin@system.com",
            name="Super Admin",
            role=UserRole.SUPER_ADMIN
        )
        db.add(admin)

        # Create Initial Products
        products = [
            Product(name='MacBook Pro M3 14"', category='Electronics', sku='LAP-001', stock=12, min_stock=10, price=1999),
            Product(name='iPhone 15 Pro Max', category='Electronics', sku='PHN-001', stock=5, min_stock=8, price=1199),
        ]
        db.add_all(products)
        
        await db.commit()
        print("Seeding finished successfully.")

if __name__ == "__main__":
    asyncio.run(run_seed())
