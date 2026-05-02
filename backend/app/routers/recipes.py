from __future__ import annotations
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, asc, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Recipe, RecipeIngredient, Ingredient
from app.schemas import RecipeSummary, IngredientSlot

router = APIRouter()


def _build_slot(ri: RecipeIngredient) -> IngredientSlot:
    return IngredientSlot(
        ingredient_id=ri.ingredient_id,
        name=ri.ingredient.name,
        image_path=ri.ingredient.image_path,
        quantity=float(ri.quantity),
        slot_order=ri.slot_order,
    )


def _to_summary(recipe: Recipe) -> RecipeSummary:
    return RecipeSummary(
        id=recipe.id,
        slug=recipe.slug,
        dish=recipe.dish,
        hunger=float(recipe.hunger),
        sanity=float(recipe.sanity),
        health=float(recipe.health),
        note=recipe.note,
        warly=recipe.warly,
        character_note=recipe.character_note,
        image_path=recipe.image_path,
        ingredients=[_build_slot(ri) for ri in recipe.recipe_ingredients],
    )


def _sort_clause(sort: str):
    match sort:
        case "health":
            return desc(Recipe.health)
        case "hunger":
            return desc(Recipe.hunger)
        case "sanity":
            return desc(Recipe.sanity)
        case _:
            return asc(Recipe.dish)


@router.get("/slugs", response_model=list[str])
async def list_slugs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Recipe.slug).order_by(asc(Recipe.slug)))
    return result.scalars().all()


@router.get("/simulate", response_model=list[RecipeSummary])
async def simulate(
    ingredient_ids: str = "",
    empty_slots: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """Return recipes matchable with the given ingredients + wildcard empty slots."""
    filled: set[int] = set()
    if ingredient_ids:
        filled = {int(x) for x in ingredient_ids.split(",") if x.strip().isdigit()}

    q = (
        select(Recipe)
        .options(selectinload(Recipe.recipe_ingredients).selectinload(RecipeIngredient.ingredient))
        .order_by(asc(Recipe.dish))
    )
    rows = (await db.execute(q)).scalars().all()

    results = []
    for recipe in rows:
        required = [ri.ingredient_id for ri in recipe.recipe_ingredients]
        if not required:
            continue
        matched = sum(1 for ing_id in required if ing_id in filled)
        if matched + empty_slots >= len(required):
            results.append(_to_summary(recipe))
    return results


@router.get("", response_model=list[RecipeSummary])
async def list_recipes(
    search: str = "",
    sort: Literal["health", "hunger", "sanity", "alphabet"] = "alphabet",
    warly: bool | None = None,
    min_health: float = -9999,
    min_hunger: float = -9999,
    min_sanity: float = -9999,
    ingredient_ids: str = "",
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(Recipe)
        .options(selectinload(Recipe.recipe_ingredients).selectinload(RecipeIngredient.ingredient))
        .order_by(_sort_clause(sort))
    )

    if search:
        q = q.where(Recipe.dish.ilike(f"%{search}%"))
    if warly is not None:
        q = q.where(Recipe.warly == warly)
    if min_health > -9999:
        q = q.where(Recipe.health >= min_health)
    if min_hunger > -9999:
        q = q.where(Recipe.hunger >= min_hunger)
    if min_sanity > -9999:
        q = q.where(Recipe.sanity >= min_sanity)

    rows = (await db.execute(q)).scalars().all()
    results = [_to_summary(r) for r in rows]

    # ingredient_ids filter: return only recipes containing ALL specified ingredients
    if ingredient_ids:
        required_ids = {int(x) for x in ingredient_ids.split(",") if x.strip().isdigit()}
        results = [
            r for r in results
            if required_ids.issubset({slot.ingredient_id for slot in r.ingredients})
        ]

    return results


@router.get("/{slug}", response_model=RecipeSummary)
async def get_recipe(slug: str, db: AsyncSession = Depends(get_db)):
    q = (
        select(Recipe)
        .where(Recipe.slug == slug)
        .options(selectinload(Recipe.recipe_ingredients).selectinload(RecipeIngredient.ingredient))
    )
    recipe = (await db.execute(q)).scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return _to_summary(recipe)
