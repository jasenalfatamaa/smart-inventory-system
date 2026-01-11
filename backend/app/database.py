import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from .config import DATABASE_URL

Base = declarative_base()

# Global variables for lazy initialization
_engine = None
_session_maker = None

def get_engine():
    global _engine
    if _engine is None:
        connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
        _engine = create_async_engine(DATABASE_URL, echo=True, connect_args=connect_args)
    return _engine

def get_session_maker():
    global _session_maker
    if _session_maker is None:
        _session_maker = async_sessionmaker(
            get_engine(), 
            autocommit=False, 
            autoflush=False, 
            class_=AsyncSession,
            expire_on_commit=False
        )
    return _session_maker

async def get_db():
    SessionLocal = get_session_maker()
    async with SessionLocal() as session:
        yield session
