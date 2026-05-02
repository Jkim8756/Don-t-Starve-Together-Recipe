from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Ingredient
from app.schemas import IngredientOut

router = APIRouter()


@router.get("", response_model=list[IngredientOut])
async def list_ingredients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ingredient).order_by(Ingredient.name))
    return result.scalars().all()
