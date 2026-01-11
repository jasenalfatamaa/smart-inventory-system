from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from redis.asyncio import Redis
from typing import List
from ..database import get_db
from ..models import Transaction, Product, User, TransactionType
from ..schemas import TransactionCreate, TransactionResponse
from ..auth import get_current_user
from .inventory import get_redis, CACHE_KEY

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.product), selectinload(Transaction.user))
        .order_by(Transaction.date.desc())
    )
    transactions = result.scalars().all()
    
    # Map to response with names
    res = []
    for t in transactions:
        data = TransactionResponse.model_validate(t)
        data.product_name = t.product.name
        data.user_name = t.user.name
        res.append(data)
    return res

@router.post("/adjust/", response_model=TransactionResponse)
async def adjust_stock(tx_in: TransactionCreate, db: AsyncSession = Depends(get_db), redis: Redis = Depends(get_redis), current_user: User = Depends(get_current_user)):
    # Atomic transaction
    async with db.begin():
        # Get product with lock (select for update)
        result = await db.execute(
            select(Product).where(Product.id == tx_in.product_id).with_for_update()
        )
        product = result.scalars().first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Update stock
        if tx_in.type == TransactionType.IN:
            product.stock += tx_in.quantity
        else:
            if product.stock < tx_in.quantity:
                raise HTTPException(status_code=400, detail="Insufficient stock")
            product.stock -= tx_in.quantity

        # Create log
        db_tx = Transaction(
            type=tx_in.type,
            quantity=tx_in.quantity,
            product_id=tx_in.product_id,
            user_id=current_user.id
        )
        db.add(db_tx)
        
    # Commit is automatic when leaving with block if no error
    await db.refresh(db_tx)
    await redis.delete(CACHE_KEY)
    
    # Load relationships for response
    result_full = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.product), selectinload(Transaction.user))
        .where(Transaction.id == db_tx.id)
    )
    t = result_full.scalars().first()
    res = TransactionResponse.model_validate(t)
    res.product_name = t.product.name
    res.user_name = t.user.name
    
    return res
