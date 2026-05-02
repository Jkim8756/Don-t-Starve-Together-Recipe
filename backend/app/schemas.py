from pydantic import BaseModel


class IngredientOut(BaseModel):
    id: int
    name: str
    image_path: str

    model_config = {"from_attributes": True}


class IngredientSlot(BaseModel):
    ingredient_id: int
    name: str
    image_path: str
    quantity: float
    slot_order: int


class RecipeSummary(BaseModel):
    id: int
    slug: str
    dish: str
    hunger: float
    sanity: float
    health: float
    note: str
    warly: bool
    character_note: str
    image_path: str
    ingredients: list[IngredientSlot] = []

    model_config = {"from_attributes": True}


class FavoriteCreate(BaseModel):
    client_id: str
    recipe_id: int


class FavoriteOut(BaseModel):
    recipe_id: int
