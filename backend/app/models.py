from __future__ import annotations
from sqlalchemy import ForeignKey, Numeric, SmallInteger, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    image_path: Mapped[str] = mapped_column(Text, nullable=False)

    recipe_slots: Mapped[list[RecipeIngredient]] = relationship(back_populates="ingredient")


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    dish: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    hunger: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    sanity: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    health: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    note: Mapped[str] = mapped_column(Text, default="")
    warly: Mapped[bool] = mapped_column(Boolean, default=False)
    character_note: Mapped[str] = mapped_column(Text, default="")
    image_path: Mapped[str] = mapped_column(Text, default="")

    recipe_ingredients: Mapped[list[RecipeIngredient]] = relationship(
        back_populates="recipe", order_by="RecipeIngredient.slot_order"
    )


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"))
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredients.id", ondelete="RESTRICT"))
    quantity: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False)
    slot_order: Mapped[int] = mapped_column(SmallInteger, default=0)

    recipe: Mapped[Recipe] = relationship(back_populates="recipe_ingredients")
    ingredient: Mapped[Ingredient] = relationship(back_populates="recipe_slots")


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[str] = mapped_column(Text, nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"))
