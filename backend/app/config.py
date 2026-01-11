import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- DATABASE ---
# Default to local SQLite if DATABASE_URL is not provided
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./inventory.db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# --- SECURITY ---
# IMPORTANT: Always set a strong JWT_SECRET in your .env file for production!
JWT_SECRET = os.getenv("JWT_SECRET", "dev_only_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "8"))

# --- AI SERVICES ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
