from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from .models import UserRole, TransactionType

def to_camel(string: str) -> str:
    words = string.split('_')
    return words[0] + ''.join(word.capitalize() for word in words[1:])

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class UserBase(BaseSchema):
    username: str
    email: Optional[EmailStr] = None
    name: str
    role: UserRole = UserRole.ADMIN
    avatar: Optional[str] = None
    phone: Optional[str] = None
    pob: Optional[str] = None
    dob: Optional[str] = None

class UserCreate(UserBase):
    password: str

class LoginRequest(BaseSchema):
    username: str
    password: str

class UserUpdate(BaseSchema):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    pob: Optional[str] = None
    dob: Optional[str] = None
    avatar: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

class Token(BaseSchema):
    access_token: str
    token_type: str
    user: UserResponse

class ProductBase(BaseSchema):
    sku: str
    name: str
    category: str
    price: float
    stock: int = 0
    min_stock: int = 5

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseSchema):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    min_stock: Optional[int] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

class TransactionBase(BaseSchema):
    type: TransactionType
    quantity: int

class TransactionCreate(TransactionBase):
    product_id: str

class TransactionResponse(TransactionBase):
    id: str
    date: datetime
    product_id: str
    user_id: str
    product_name: Optional[str] = None
    user_name: Optional[str] = None

class AIInsightRequest(BaseSchema):
    inventory_summary: List[dict]
