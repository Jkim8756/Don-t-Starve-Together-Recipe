#!/usr/bin/env python3
"""Idempotent seed script for DST Recipe Browser. Run from backend/: python -m app.seed.seed"""
import asyncio
import os
import re
import sys
from pathlib import Path

# allow running from backend/ or backend/app/seed/
env_path = Path(__file__).resolve().parents[2] / ".env"
from dotenv import load_dotenv
load_dotenv(dotenv_path=env_path)

import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")

def slugify(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[''']", "", name)   # remove apostrophes
    name = re.sub(r"[^a-z0-9]+", "-", name)
    return name.strip("-")

INGREDIENTS = [
    ("Asparaguses",    "/ingredients/Asparaguses.png"),
    ("Barnacle",       "/ingredients/Barnacle.png"),
    ("Bone_Shards",    "/ingredients/Bone_Shards.png"),
    ("Butter",         "/ingredients/Butter.png"),
    ("Butterfly_Wings","/ingredients/Butterfly_Wings.png"),
    ("Cactus_Flesh",   "/ingredients/Cactus_Flesh.png"),
    ("Cactus_Flower",  "/ingredients/Cactus_Flower.png"),
    ("Cave_Bananas",   "/ingredients/Cave_Bananas.png"),
    ("Cooked_Mussel",  "/ingredients/Cooked_Mussel.png"),
    ("Corns",          "/ingredients/Corns.png"),
    ("Dairy_product",  "/ingredients/Dairy_product.png"),
    ("Dragon_Fruits",  "/ingredients/Dragon_Fruits.png"),
    ("Drumstick",      "/ingredients/Drumstick.png"),
    ("Eggs",           "/ingredients/Eggs.png"),
    ("Fishes",         "/ingredients/Fishes.png"),
    ("Forget-Me-Lots", "/ingredients/Forget-Me-Lots.png"),
    ("Frog_Leg",       "/ingredients/Frog_Leg.png"),
    ("Fruit",          "/ingredients/Fruit.png"),
    ("Garlics",        "/ingredients/Garlics.png"),
    ("Glow_Berry",     "/ingredients/Glow_Berry.png"),
    ("Honey",          "/ingredients/Honey.png"),
    ("Ice",            "/ingredients/Ice.png"),
    ("Jellyfish",      "/ingredients/Jellyfish.png"),
    ("Kelp_Fronds",    "/ingredients/Kelp_Fronds.png"),
    ("Leafy_Meats",    "/ingredients/Leafy_Meats.png"),
    ("Limpets",        "/ingredients/Limpets.png"),
    ("Meats",          "/ingredients/Meats.png"),
    ("Moleworm",       "/ingredients/Moleworm.png"),
    ("Mussel",         "/ingredients/Mussel.png"),
    ("Naked_Nostrils", "/ingredients/Naked_Nostrils.png"),
    ("Onions",         "/ingredients/Onions.png"),
    ("Potatoes",       "/ingredients/Potatoes.png"),
    ("Ripe_Stone_Fruit","/ingredients/Ripe_Stone_Fruit.png"),
    ("Royal_Jelly",    "/ingredients/Royal_Jelly.png"),
    ("Tallbird_Egg",   "/ingredients/Tallbird_Egg.png"),
    ("Twigs",          "/ingredients/Twigs.png"),
    ("Vegetables",     "/ingredients/Vegetables.png"),
    ("Volt_Goat_Horn", "/ingredients/Volt_Goat_Horn.png"),
    ("Watermelon",     "/ingredients/Watermelon.png"),
    ("Wobster",        "/ingredients/Wobster.png"),
]

# (dish, hunger, sanity, health, note, warly, character_note, image_path)
# Canonical stats from data.json. Typos fixed. Names normalized to title case.
RECIPES = [
    ("Bacon and Eggs",         75,    5,    20,   "",                                          False, "",                      "/dishes/Bacon_and_Eggs.png"),
    ("Butter Muffin",          37.5,  5,    20,   "",                                          False, "",                      "/dishes/Butter_Muffin.png"),
    ("Dragonpie",              75,    5,    40,   "",                                          False, "",                      "/dishes/Dragonpie.png"),
    ("Fish Tacos",             37.5,  5,    20,   "",                                          False, "",                      ""),
    ("Fishsticks",             37.5,  5,    40,   "",                                          False, "",                      "/dishes/Fishsticks.png"),
    ("Fist Full of Jam",       37.5,  5,    3,    "",                                          False, "",                      "/dishes/Fist_Full_of_Jam.png"),
    ("Froggle Bunwich",        37.5,  5,    20,   "",                                          False, "",                      "/dishes/Froggle_Bunwich.png"),
    ("Fruit Medley",           25,    5,    20,   "",                                          False, "Maxwell",               ""),
    ("Honey Ham",              75,    5,    30,   "",                                          False, "",                      "/dishes/Honey_Ham.png"),
    ("Honey Nuggets",          37.5,  5,    20,   "",                                          False, "",                      "/dishes/Honey_Nuggets.png"),
    ("Kabobs",                 37.5,  5,    3,    "",                                          False, "",                      "/dishes/Kabobs.png"),
    ("Mandrake Soup",          150,   5,    100,  "",                                          False, "",                      ""),
    ("Meatballs",              37.5,  5,    3,    "",                                          False, "",                      "/dishes/Meatballs.png"),
    ("Meaty Stew",             150,   5,    12,   "",                                          False, "",                      "/dishes/Meaty_Stew.png"),
    ("Monster Lasagna",        37.5,  -20,  -20,  "",                                          False, "no penalty for Webber", ""),
    ("Pierogi",                37.5,  5,    40,   "",                                          False, "",                      "/dishes/Pierogi.png"),
    ("Powdercake",             0,     0,    -3,   "",                                          False, "",                      "/dishes/Powdercake.png"),
    ("Pumpkin Cookie",         37.5,  15,   0,    "",                                          False, "",                      ""),
    ("Ratatouille",            25,    5,    3,    "",                                          False, "",                      "/dishes/Ratatouille.png"),
    ("Stuffed Eggplant",       37.5,  5,    3,    "",                                          False, "",                      ""),
    ("Taffy",                  25,    15,   -3,   "",                                          False, "",                      "/dishes/Taffy.png"),
    ("Turkey Dinner",          75,    5,    20,   "",                                          False, "",                      "/dishes/Turkey_Dinner.png"),
    ("Unagi",                  18.75, 5,    20,   "",                                          False, "",                      ""),
    ("Waffles",                37.5,  5,    60,   "",                                          False, "",                      ""),
    ("Wet Goop",               0,     0,    0,    "",                                          False, "",                      ""),
    ("Amberosia",              0,     0,    0,    "inedible",                                  False, "",                      ""),
    ("Asparagus",              18.75, 5,    20,   "",                                          False, "",                      ""),
    ("Banana Pop",             12.5,  33,   20,   "",                                          False, "",                      ""),
    ("Banana Shake",           25,    33,   8,    "",                                          False, "",                      ""),
    ("Barnacle Linguine",      75,    20,   10,   "",                                          False, "",                      "/dishes/Barnacle_Linguine.png"),
    ("Barnacle Nigiri",        37.5,  5,    40,   "",                                          False, "",                      ""),
    ("Barnacle Pita",          37.5,  5,    20,   "",                                          False, "",                      ""),
    ("Beefy Greens",           75,    5,    40,   "",                                          False, "",                      "/dishes/Beefy_Greens.png"),
    ("Breakfast Skillet",      37.5,  5,    20,   "",                                          False, "",                      "/dishes/Breakfast_Skillet.png"),
    ("Bunny Stew",             37.5,  5,    20,   "",                                          False, "",                      "/dishes/Bunny_Stew.png"),
    ("California Roll",        37.5,  10,   20,   "",                                          False, "",                      "/dishes/California_Roll.png"),
    ("Ceviche",                25,    5,    20,   "",                                          False, "",                      "/dishes/Ceviche.png"),
    ("Creamy Potato Puree",    37.5,  33,   20,   "",                                          False, "",                      "/dishes/Creamy_Potato_Purre.png"),
    ("Fancy Spiralled Tubers", 37.5,  15,   3,    "",                                          False, "",                      "/dishes/Fancy_Spiralled_Tubers.png"),
    ("Frozen Banana Daiquiri", 18.75, 15,   30,   "",                                          False, "",                      ""),
    ("Jelly Beans",            0,     5,    122,  "recover 122 hp over 2min",                  False, "",                      "/dishes/Jellybeans.png"),
    ("Jelly Salad",            37.5,  50,   0,    "",                                          False, "",                      "/dishes/Jelly_Salad.png"),
    ("Milkmade Hat",           187.5, -5.3, 0,    "recover 187.5 hp over 4min, lose 5.3 sanity over 4min", False, "",          "/dishes/Milkmade_Hat.png"),
    ("Mushy Cake",             25,    10,   0,    "provides immunity to sleep for 1 day",      False, "",                      "/dishes/Mushy_Cake.png"),
    ("Leafy Meatloaf",         37.5,  5,    8,    "",                                          False, "",                      "/dishes/Leafy_Meatloaf.png"),
    ("Plain Omelette",         50,    5,    3,    "",                                          False, "",                      "/dishes/Plain_Omelette.png"),
    ("Salsa Fresca",           25,    33,   3,    "",                                          False, "",                      ""),
    ("Seafood Gumbo",          37.5,  20,   40,   "",                                          False, "",                      "/dishes/Seafood_Gumbo.png"),
    ("Stuffed Fish Heads",     75,    0,    20,   "",                                          False, "",                      "/dishes/Stuffed_Fish_Heads.png"),
    ("Stuffed Pepper Poppers", 25,    -5,   30,   "",                                          False, "",                      ""),
    ("Tall Scotch Eggs",       150,   5,    60,   "",                                          False, "",                      "/dishes/Tall_scotch_eggs.png"),
    ("Vegetable Stinger",      25,    33,   3,    "",                                          False, "",                      ""),
    ("Figatoni",               56.25, 15,   30,   "",                                          False, "",                      ""),
    ("Figgy Frogwich",         18.75, 15,   30,   "",                                          False, "",                      ""),
    ("Figkabab",               25,    15,   20,   "",                                          False, "",                      "/dishes/Figkabab.png"),
    ("Fig-Stuffed Trunk",      56.25, 0,    60,   "",                                          False, "",                      "/dishes/Fig-Stuffed_Trunk.png"),
    ("Soothing Tea",           0,     45,   3,    "recover 15 sanity and then 30 sanity over 1min", False, "",               "/dishes/Soothing_Tea.png"),
    ("Flower Salad",           12.5,  5,    40,   "",                                          False, "",                      "/dishes/Flower_Salad.png"),
    ("Guacamole",              37.5,  0,    20,   "",                                          False, "",                      "/dishes/Guacamole.png"),
    ("Ice Cream",              25,    50,   0,    "",                                          False, "",                      ""),
    ("Melonsicle",             12.5,  20,   3,    "",                                          False, "",                      "/dishes/Melonsicle.png"),
    ("Spicy Chili",            37.5,  0,    20,   "",                                          False, "",                      "/dishes/Spicy_Chili.png"),
    ("Trail Mix",              12.5,  5,    30,   "",                                          False, "",                      ""),
    ("Surf'n'Turf",            37.5,  33,   60,   "",                                          False, "",                      "/dishes/Surf_27_Turf.png"),
    ("Wobster Bisque",         25,    0,    60,   "wobster must be alive",                     False, "",                      "/dishes/Lobster_Bisque.png"),
    ("Wobster Dinner",         37.5,  50,   60,   "wobster must be alive",                     False, "",                      "/dishes/Lobster_Dinner.png"),
    ("Asparagazpacho",         25,    10,   3,    "Decreases perceived temperature by 40 degrees for 5 minutes.", True, "",   ""),
    ("Bone Bouillon",          150,   5,    32,   "",                                          True,  "",                      "/dishes/Bone_Bouillon.png"),
    ("Fish Cordon Bleu",       37.5,  -10,  20,   "Provides wetness immunity for 5 minutes.",  True,  "",                      "/dishes/Fish_Cordon_Bleu.png"),
    ("Fresh Fruit Crepes",     150,   15,   60,   "",                                          True,  "",                      ""),
    ("Glow Berry Mousse",      37.5,  10,   3,    "Makes the player glow for 2 days.",          True,  "",                      "/dishes/Glow_Berry_Mousse.png"),
    ("Grim Galette",           25,    5,    1,    "Swaps Sanity and HP values",                True,  "",                      ""),
    ("Hot Dragon Chili Salad", 25,    10,   -3,   "Increases perceived temperature by 40 degrees for 5 minutes.", True, "",   ""),
    ("Monster Tartare",        62.5,  -20,  -20,  "",                                          True,  "",                      ""),
    ("Moqueca",                112.5, 33,   20,   "",                                          True,  "",                      ""),
    ("Puffed Potato Souffle",  37.5,  15,   20,   "",                                          True,  "",                      "/dishes/Puffed_Potato_Souffle.png"),
    ("Volt Goat Chaud-Froid",  37.5,  10,   3,    "Applies electrical damage to player attacks for 5 minutes.", True, "",    "/dishes/Volt_Goat_Chaud-Froid.png"),
]

# ingredient name → ingredient DB name (resolves JS import aliases)
INGREDIENT_MAP = {
    "Meats":          "Meats",
    "Eggs":           "Eggs",
    "Asparaguses":    "Asparaguses",
    "Cactus_Flesh":   "Cactus_Flesh",
    "Cactus_Flower":  "Cactus_Flower",
    "Cave_Bananas":   "Cave_Bananas",
    "Corns":          "Corns",
    "Dairy_product":  "Dairy_product",
    "Dragon_Fruits":  "Dragon_Fruits",
    "Drumstick":      "Drumstick",
    "Fishes":         "Fishes",
    "Forget-Me-Lots": "Forget-Me-Lots",
    "Frog_Leg":       "Frog_Leg",
    "Fruit":          "Fruit",
    "Garlics":        "Garlics",
    "Honey":          "Honey",
    "Ice":            "Ice",
    "Kelp_Fronds":    "Kelp_Fronds",
    "Leafy_Meats":    "Leafy_Meats",
    "Moleworm":       "Moleworm",
    "Naked_Nostrils": "Naked_Nostrils",
    "Potatoes":       "Potatoes",
    "Ripe_Stone_Fruit":"Ripe_Stone_Fruit",
    "Royal_Jelly":    "Royal_Jelly",
    "Twigs":          "Twigs",
    "Watermelon":     "Watermelon",
    "Wobster":        "Wobster",
    "Butter":         "Butter",
    "Cooked_Mussel":  "Cooked_Mussel",
    "Limpets":        "Limpets",
    "Jellyfish":      "Jellyfish",
    "Butterfly_Wings":"Butterfly_Wings",
    "Vegetables":     "Vegetables",
    "Barnacle":       "Barnacle",
    "Tallbird_Egg":   "Tallbird_Egg",
    "Bone_Shards":    "Bone_Shards",
    "Onions":         "Onions",
    "Glow_Berry":     "Glow_Berry",
    "Volt_Goat_Horn": "Volt_Goat_Horn",
}

# dish name → [(ingredient_name, quantity, slot_order), ...]
# Derived from Data.js. Dragonpie ingredient bug fixed: Dragon_Fruits instead of dish icon.
RECIPE_INGREDIENTS: dict[str, list[tuple[str, float, int]]] = {
    "Meatballs":              [("Meats", 0.5, 0)],
    "Honey Ham":              [("Meats", 1.5, 0), ("Honey", 1, 1)],
    "Bacon and Eggs":         [("Meats", 1.5, 0), ("Eggs", 1.5, 1)],
    "Pierogi":                [("Meats", 0.5, 0), ("Eggs", 1, 1), ("Vegetables", 1, 2)],
    "Meaty Stew":             [("Meats", 3, 0)],
    "Turkey Dinner":          [("Drumstick", 2, 0), ("Meats", 0.5, 1)],
    "Beefy Greens":           [("Leafy_Meats", 1, 0), ("Vegetables", 3, 1)],
    "Tall Scotch Eggs":       [("Tallbird_Egg", 1, 0), ("Vegetables", 1, 1)],
    "Dragonpie":              [("Dragon_Fruits", 1, 0)],
    "Stuffed Fish Heads":     [("Barnacle", 1, 0), ("Fishes", 1, 1)],
    "Plain Omelette":         [("Eggs", 3, 0)],
    "Butter Muffin":          [("Butterfly_Wings", 1, 0), ("Vegetables", 0.5, 1)],
    "Fishsticks":             [("Fishes", 0.5, 0), ("Twigs", 1, 1)],
    "Fist Full of Jam":       [("Fruit", 0.5, 0)],
    "Froggle Bunwich":        [("Frog_Leg", 1, 0), ("Vegetables", 0.5, 1)],
    "Honey Nuggets":          [("Meats", 0.5, 0), ("Honey", 1, 1)],
    "Kabobs":                 [("Meats", 0.5, 0), ("Twigs", 1, 1)],
    "Breakfast Skillet":      [("Eggs", 1, 0), ("Vegetables", 1, 1)],
    "Fancy Spiralled Tubers": [("Potatoes", 1, 0), ("Twigs", 1, 1)],
    "Jelly Salad":            [("Leafy_Meats", 2, 0), ("Honey", 2, 1)],
    "Guacamole":              [("Cactus_Flesh", 1, 0), ("Moleworm", 1, 1)],
    "Spicy Chili":            [("Vegetables", 1.5, 0), ("Meats", 1.5, 1)],
    "California Roll":        [("Kelp_Fronds", 2, 0), ("Fishes", 1, 1)],
    "Surf'n'Turf":            [("Meats", 2, 0), ("Fishes", 1.5, 1)],
    "Wobster Dinner":         [("Wobster", 1, 0), ("Butter", 1, 1)],
    "Ratatouille":            [("Vegetables", 0.5, 0)],
    "Taffy":                  [("Honey", 3, 0)],
    "Wobster Bisque":         [("Wobster", 1, 0), ("Ice", 1, 1)],
    "Flower Salad":           [("Cactus_Flower", 1, 0), ("Vegetables", 1.5, 1)],
    "Powdercake":             [("Corns", 1, 0), ("Honey", 1, 1), ("Twigs", 1, 2)],
    "Jelly Beans":            [("Royal_Jelly", 1, 0)],
    "Soothing Tea":           [("Forget-Me-Lots", 1, 0), ("Honey", 1, 1), ("Ice", 1, 2)],
    "Bone Bouillon":          [("Bone_Shards", 2, 0), ("Onions", 1, 1)],
    "Puffed Potato Souffle":  [("Potatoes", 2, 0), ("Eggs", 1, 1)],
    "Volt Goat Chaud-Froid":  [("Volt_Goat_Horn", 1, 0), ("Honey", 2, 1)],
    "Glow Berry Mousse":      [("Glow_Berry", 1, 0), ("Fruit", 1, 1)],
    "Fish Cordon Bleu":       [("Frog_Leg", 2, 0), ("Fishes", 1, 1)],
}


async def seed():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # 1. Ingredients
        for name, image_path in INGREDIENTS:
            await conn.execute(
                "INSERT INTO ingredients(name, image_path) VALUES($1,$2) ON CONFLICT(name) DO NOTHING",
                name, image_path,
            )
        ing_count = await conn.fetchval("SELECT count(*) FROM ingredients")
        print(f"  ingredients: {ing_count}")

        # 2. Recipes
        for (dish, hunger, sanity, health, note, warly, character_note, image_path) in RECIPES:
            slug = slugify(dish)
            await conn.execute(
                """INSERT INTO recipes(dish, slug, hunger, sanity, health, note, warly, character_note, image_path)
                   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(slug) DO NOTHING""",
                dish, slug, hunger, sanity, health, note, warly, character_note, image_path,
            )
        rec_count = await conn.fetchval("SELECT count(*) FROM recipes")
        print(f"  recipes:     {rec_count}")

        # 3. Recipe ingredients
        ri_inserted = 0
        for dish, ing_list in RECIPE_INGREDIENTS.items():
            recipe_id = await conn.fetchval("SELECT id FROM recipes WHERE dish=$1", dish)
            if not recipe_id:
                print(f"  WARNING: recipe not found: {dish!r}")
                continue
            for ing_name, quantity, slot_order in ing_list:
                db_name = INGREDIENT_MAP.get(ing_name, ing_name)
                ing_id = await conn.fetchval("SELECT id FROM ingredients WHERE name=$1", db_name)
                if not ing_id:
                    print(f"  WARNING: ingredient not found: {ing_name!r} (mapped to {db_name!r})")
                    continue
                result = await conn.execute(
                    """INSERT INTO recipe_ingredients(recipe_id, ingredient_id, quantity, slot_order)
                       VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING""",
                    recipe_id, ing_id, quantity, slot_order,
                )
                if result == "INSERT 0 1":
                    ri_inserted += 1
        ri_total = await conn.fetchval("SELECT count(*) FROM recipe_ingredients")
        print(f"  recipe_ingredients: {ri_total}")

        print("\nSeed complete.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
