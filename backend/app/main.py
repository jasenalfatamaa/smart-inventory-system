from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .routers import auth, inventory, transactions, ai
from .database import Base, get_db
import asyncio

app = FastAPI(title="Smart Inventory API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(transactions.router)
app.include_router(ai.router)

if not os.getenv("TESTING"):
    @app.on_event("startup")
    async def startup():
        # Create tables and seed data
        try:
            from seed import run_seed
            await run_seed()
        except Exception as e:
            print(f"Error during auto-seed: {e}")

@app.get("/")
async def root():
    return {"message": "Smart Inventory Python Backend is running!"}
