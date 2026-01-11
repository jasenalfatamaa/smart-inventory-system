import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from redis.asyncio import Redis
from typing import List
from ..database import get_db
from ..models import Product, User, UserRole
from ..schemas import ProductCreate, ProductUpdate, ProductResponse
from ..auth import get_current_user, check_role
from ..config import REDIS_URL

router = APIRouter(prefix="/api/inventory", tags=["inventory"])
CACHE_KEY = "products_list"

async def get_redis():
    client = await Redis.from_url(REDIS_URL, decode_responses=True)
    try:
        yield client
    finally:
        await client.close()

@router.get("/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db), redis: Redis = Depends(get_redis), current_user: User = Depends(get_current_user)):
    # Try cache
    cached = await redis.get(CACHE_KEY)
    if cached:
        return json.loads(cached)
    
    # DB fallback
    result = await db.execute(select(Product).order_by(Product.updated_at.desc()))
    products = result.scalars().all()
    
    # Save to Redis for 5 mins
    await redis.setex(CACHE_KEY, 300, json.dumps([ProductResponse.model_validate(p).model_dump(mode='json') for p in products]))
    
    return products

@router.post("/", response_model=ProductResponse)
async def create_product(product_in: ProductCreate, db: AsyncSession = Depends(get_db), redis: Redis = Depends(get_redis), current_user: User = Depends(check_role([UserRole.SUPER_ADMIN, UserRole.ADMIN]))):
    result = await db.execute(select(Product).where(Product.sku == product_in.sku))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    await redis.delete(CACHE_KEY)
    return db_product

@router.put("/{product_id}/", response_model=ProductResponse)
async def update_product(product_id: str, product_in: ProductUpdate, db: AsyncSession = Depends(get_db), redis: Redis = Depends(get_redis), current_user: User = Depends(check_role([UserRole.SUPER_ADMIN, UserRole.ADMIN]))):
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    for field, value in product_in.model_dump(exclude_unset=True).items():
        setattr(db_product, field, value)
    
    await db.commit()
    await db.refresh(db_product)
    
    await redis.delete(CACHE_KEY)
    return db_product

@router.delete("/{product_id}/")
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db), redis: Redis = Depends(get_redis), current_user: User = Depends(check_role([UserRole.SUPER_ADMIN]))):
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(db_product)
    await db.commit()
    
    await redis.delete(CACHE_KEY)
    return {"message": "Product deleted"}
