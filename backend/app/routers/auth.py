from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserCreate, UserUpdate, UserResponse, Token, LoginRequest
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user, check_role

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login/", response_model=Token, response_model_by_alias=True)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == login_data.username))
    user = result.scalars().first()
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/register/", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(check_role([UserRole.SUPER_ADMIN]))):
    result = await db.execute(select(User).where(User.username == user_in.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        password=hashed_password,
        name=user_in.name,
        role=user_in.role,
        avatar=user_in.avatar,
        phone=user_in.phone,
        pob=user_in.pob,
        dob=user_in.dob
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/users/", response_model=list[UserResponse])
async def get_users(db: AsyncSession = Depends(get_db), current_user: User = Depends(check_role([UserRole.SUPER_ADMIN]))):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.put("/profile/", response_model=UserResponse)
async def update_profile(user_in: UserUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    for field, value in user_in.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.delete("/users/{user_id}/")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(check_role([UserRole.SUPER_ADMIN]))):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"message": "User deleted"}
