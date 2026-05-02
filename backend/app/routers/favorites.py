from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import FavoriteCreate, FavoriteOut
import uuid as _uuid

router = APIRouter()

# favorites.client_id is UUID in Postgres. Pass Python uuid.UUID objects so asyncpg
# handles the type mapping without needing ::uuid casts in SQL text.


def _parse_uuid(value: str) -> _uuid.UUID:
    try:
        return _uuid.UUID(value)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid client_id UUID format")


@router.get("", response_model=list[FavoriteOut])
async def get_favorites(client_id: str, db: AsyncSession = Depends(get_db)):
    rows = await db.execute(
        text("SELECT recipe_id FROM favorites WHERE client_id = :c"),
        {"c": _parse_uuid(client_id)},
    )
    return [{"recipe_id": row[0]} for row in rows.all()]


@router.post("", status_code=201)
async def add_favorite(body: FavoriteCreate, db: AsyncSession = Depends(get_db)):
    await db.execute(
        text("INSERT INTO favorites(client_id, recipe_id) VALUES(:c, :r) ON CONFLICT DO NOTHING"),
        {"c": _parse_uuid(body.client_id), "r": body.recipe_id},
    )
    await db.commit()
    return {"ok": True}


@router.delete("", status_code=204)
async def remove_favorite(client_id: str, recipe_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        text("DELETE FROM favorites WHERE client_id = :c AND recipe_id = :r"),
        {"c": _parse_uuid(client_id), "r": recipe_id},
    )
    await db.commit()
