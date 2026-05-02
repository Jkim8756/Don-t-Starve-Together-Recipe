from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.routers import recipes, ingredients, favorites

load_dotenv()

app = FastAPI(title="DST Recipe API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
app.include_router(ingredients.router, prefix="/ingredients", tags=["ingredients"])
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])


@app.get("/health")
async def health():
    return {"status": "ok"}
