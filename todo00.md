# DST Recipe Browser v2 — Master Task Board

**Project Goal:** Full rebuild of the Don't Starve Together Crock Pot recipe browser as a FastAPI + Neon + Next.js 14 app with working search, filtering, per-recipe favorites, and a Crock Pot Simulator.

**Old project (read-only reference):** `/Users/mac19/Projects/Project04_DST_cooking_recipe/`
**New project root:** `/Users/mac19/Projects/DST-recipe-v2/`

**Legend:** Status = `todo` | `in-progress` | `done` | `blocked`

---

## Phase 0 — Environment & Scaffolding

| Task ID | Workstream | Task Description | Owner | Depends On | Status | Notes |
|---------|-----------|-----------------|-------|-----------|--------|-------|
| P0-01 | devops-config-manager | Create directory structure: `backend/app/routers/`, `backend/app/seed/`, `frontend/` (placeholder only — Next.js scaffold comes in P2). Write `backend/requirements.txt` with: `fastapi`, `uvicorn[standard]`, `asyncpg`, `sqlalchemy[asyncio]`, `pydantic[email]` (v2), `python-dotenv`. Write `backend/.env` with placeholder values for `DATABASE_URL`, `FRONTEND_ORIGIN=http://localhost:3000`, `PORT=8000`. | devops-config-manager | — | todo | Do NOT scaffold the Next.js frontend yet — that happens in P2-01 via create-next-app |
| P0-02 | devops-config-manager | Write `CLAUDE.md` at project root (`/Users/mac19/Projects/DST-recipe-v2/CLAUDE.md`) documenting: project structure, how to start backend (`uvicorn app.main:app --reload` from `backend/`), how to start frontend (`npm run dev` from `frontend/`), env var locations, old project reference path, and the 39-ingredient / 73-recipe data facts. | devops-config-manager | P0-01 | todo | |
| P0-03 | devops-config-manager | Copy image assets from old project to `frontend/public/`. Run these commands exactly: `OLD="/Users/mac19/Projects/Project04_DST_cooking_recipe/src/data"` then `NEW="/Users/mac19/Projects/DST-recipe-v2/frontend/public"`, then `mkdir -p "$NEW"` and copy: `cp -r "$OLD/ingredients/" "$NEW/ingredients/"`, `cp -r "$OLD/dish/" "$NEW/dishes/"`, `cp -r "$OLD/icons/" "$NEW/icons/"`, `cp -r "$OLD/image/" "$NEW/image/"`, `cp -r "$OLD/portraits/" "$NEW/portraits/"`, `cp -r "$OLD/font/" "$NEW/fonts/"`. Then fix the URL-encoded filename: `mv "$NEW/dishes/Puffed_Potato_Souffl%3F.png" "$NEW/dishes/Puffed_Potato_Souffle.png"`. Also copy the `any.png` file from `$OLD/image/any.png` — it is used as the wildcard/random ingredient icon. | devops-config-manager | P0-01 | todo | Old project is at the underscored path `Project04_DST_cooking_recipe`, NOT the spaced one. Confirm `any.png` exists after copy — it's referenced in index.js as the `random` export and will be used by the Simulator. |

---

## Phase 1 — Database

| Task ID | Workstream | Task Description | Owner | Depends On | Status | Notes |
|---------|-----------|-----------------|-------|-----------|--------|-------|
| P1-01 | data-engineer | Create a new Neon project named `dst-recipe-v2` using the Neon MCP tool. Retrieve and save the connection string. Update `backend/.env` with the real `DATABASE_URL` value in the format `postgresql+asyncpg://<user>:<pass>@<host>/neondb?sslmode=require`. | data-engineer | P0-01 | todo | Use Neon MCP `create_project` then `get_connection_string` |
| P1-02 | data-engineer | Run the following schema SQL against the Neon project using the Neon MCP `run_sql` tool. Run all statements in one transaction: CREATE TABLE ingredients, recipes, recipe_ingredients, favorites — plus all 5 CREATE INDEX statements. Full SQL is in the plan file at `/Users/mac19/.claude/plans/this-was-an-old-scalable-rabin.md` under "Neon PostgreSQL Schema". Verify by running `SELECT table_name FROM information_schema.tables WHERE table_schema='public'` and confirming all 4 tables are present. | data-engineer | P1-01 | todo | |
| P1-03 | data-engineer | Write `backend/app/seed/seed.py`. The script must be idempotent (use `ON CONFLICT DO NOTHING` throughout). It must: (1) Insert 39 ingredients using the name→image_path mapping derived from `index.js` — see ingredient table below. (2) Insert 73 recipes from `data.json` — slug = `dish.lower().replace non-alphanumeric with hyphens`, image_path = `/dishes/<PngFilename>` mapped from `index.js` dish exports where available, else `""`. Handle null stats (amberosia) by defaulting to 0. (3) Insert recipe_ingredient rows for the 39 recipes in `Data.js` — map Data.js variable names to ingredient names using the table below. Use `asyncpg` directly (not SQLAlchemy ORM) for simplicity. Load `DATABASE_URL` from `backend/.env` via `python-dotenv`. | data-engineer | P1-02 | todo | See ingredient mapping table and recipe-ingredient mapping notes at bottom of this file. Jellyfish is imported in Data.js but used in zero recipes — still insert it as an ingredient. |
| P1-04 | data-engineer | Run `seed.py` from the `backend/` directory: `python -m app.seed.seed`. Verify with Neon MCP `run_sql`: `SELECT COUNT(*) FROM ingredients` → expect 39, `SELECT COUNT(*) FROM recipes` → expect 73, `SELECT COUNT(*) FROM recipe_ingredients` → expect the total row count (varies; should be > 60 rows). Fix any errors and re-run. | data-engineer | P1-03 | todo | |

---

## Phase 2 — Backend API

| Task ID | Workstream | Task Description | Owner | Depends On | Status | Notes |
|---------|-----------|-----------------|-------|-----------|--------|-------|
| P2-01 | backend-data-processor | Write `backend/app/database.py`. Create an async SQLAlchemy engine using `DATABASE_URL` from env. Expose `AsyncSessionLocal` (session factory) and an `async_session` dependency function for FastAPI dependency injection. | backend-data-processor | P1-01 | todo | |
| P2-02 | backend-data-processor | Write `backend/app/models.py`. Define SQLAlchemy 2.x mapped classes for all 4 tables (`Ingredient`, `Recipe`, `RecipeIngredient`, `Favorite`) matching the schema exactly. Use `Mapped` and `mapped_column` style (SQLAlchemy 2.x). | backend-data-processor | P2-01 | todo | |
| P2-03 | backend-data-processor | Write `backend/app/schemas.py`. Define Pydantic v2 models: `IngredientOut` (id, name, image_path), `RecipeIngredientOut` (ingredient_id, name, image_path, quantity, slot_order), `RecipeSummary` (id, slug, dish, hunger, sanity, health, note, warly, character_note, image_path, ingredients: list[RecipeIngredientOut]), `RecipeDetail` (same as RecipeSummary — no additional fields needed), `FavoriteIn` (client_id: UUID, recipe_id: int), `FavoriteOut` (id, client_id, recipe_id, created_at). | backend-data-processor | P2-02 | todo | |
| P2-04 | backend-data-processor | Write `backend/app/routers/ingredients.py`. Single endpoint: `GET /ingredients` — query all 39 ingredients ordered by name, return `list[IngredientOut]`. | backend-data-processor | P2-03 | todo | |
| P2-05 | backend-data-processor | Write `backend/app/routers/recipes.py`. Implement 3 endpoints: (A) `GET /recipes` with query params: `search: str = ""`, `sort: str = "alphabet"` (values: health/hunger/sanity/alphabet), `warly: bool | None = None`, `min_health: float = 0`, `min_hunger: float = 0`, `min_sanity: float = 0`, `ingredient_ids: list[int] = []`. Filter logic: search uses `ILIKE '%search%'` on dish; warly filters `WHERE warly = true`; min_* are `>=` filters; ingredient_ids filter returns only recipes containing ALL specified ingredients (use EXISTS subquery per ingredient_id). Returns `list[RecipeSummary]` with nested ingredients. (B) `GET /recipes/simulate` with `ingredient_ids: list[int]` — returns recipes where every recipe_ingredient row's ingredient_id is in the provided list (subset match). A recipe with 0 ingredient rows should NOT be returned. (C) `GET /recipes/{slug}` — single recipe by slug, returns `RecipeDetail`, raises 404 if not found. IMPORTANT: register `/recipes/simulate` before `/recipes/{slug}` in the router to avoid the slug param capturing "simulate". | backend-data-processor | P2-03 | todo | The simulate endpoint: recipe matches if `NOT EXISTS (SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id AND ri.ingredient_id NOT IN (...provided ids...)) AND EXISTS (SELECT 1 FROM recipe_ingredients ri2 WHERE ri2.recipe_id = r.id)` |
| P2-06 | backend-data-processor | Write `backend/app/routers/favorites.py`. Three endpoints: `GET /favorites?client_id=<uuid>` → list of recipe_ids (list[int]); `POST /favorites` body `FavoriteIn` → insert row, return 201, ignore duplicate (ON CONFLICT DO NOTHING); `DELETE /favorites?client_id=<uuid>&recipe_id=<int>` → delete row, return 204. | backend-data-processor | P2-03 | todo | |
| P2-07 | backend-data-processor | Write `backend/app/main.py`. Create FastAPI app, configure CORS (allow `FRONTEND_ORIGIN` from env, allow all methods and headers), mount all 3 routers with prefix `/` (no prefix — routes are already fully qualified in the routers). Add a `GET /health` endpoint returning `{"status": "ok"}`. | backend-data-processor | P2-04, P2-05, P2-06 | todo | |
| P2-08 | backend-data-processor | Verify backend works: run `uvicorn app.main:app --reload` from `backend/`. Hit `GET /health`, `GET /ingredients`, `GET /recipes` (expect 73), `GET /recipes?search=meat` (expect ≥ 2), `GET /recipes?warly=true` (expect 10), `GET /recipes/simulate?ingredient_ids=1` (adjust ID for Meats — expect Meatballs, Meaty Stew, others), `GET /recipes/meatballs` (expect full detail). Fix any issues before marking done. | backend-data-processor | P2-07, P1-04 | todo | |

---

## Phase 3 — Frontend Scaffold & Data Layer

| Task ID | Workstream | Task Description | Owner | Depends On | Status | Notes |
|---------|-----------|-----------------|-------|-----------|--------|-------|
| P3-01 | devops-config-manager | Scaffold the Next.js frontend: from the `DST-recipe-v2/` root run `npx create-next-app@14 frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"`. After scaffold, write `frontend/.env.local` with `API_URL=http://localhost:8000`. Update `frontend/next.config.ts` to add the `images.domains` or `remotePatterns` config (none needed — all images are local public files). | devops-config-manager | P2-08, P0-03 | todo | Public asset copy (P0-03) must be done before this so the public/ folder exists |
| P3-02 | frontend-designer | Write `frontend/tailwind.config.ts`. Extend the theme with DST color tokens: `"dst-brown": "#3d2b1f"`, `"dst-gold": "#c8a84b"`, `"dst-dark": "#1a1208"`, `"dst-parchment": "#e8d5b0"`, `"warly-pink": "#f9d5c5"`. Add font family `dst: ["belisa_plumilla", "serif"]`. Add background image `frame: "url('/image/frame.png')"`. Configure `darkMode: "class"`. | frontend-designer | P3-01 | todo | |
| P3-03 | frontend-designer | Write `frontend/app/layout.tsx`. Load the `belisa_plumilla` font from `public/fonts/` using `next/font/local`. Apply `font-dst` and `bg-dst-dark text-dst-parchment` as body base classes. Include `<ThemeProvider>` wrapper (implement as a simple Client Component that reads localStorage `theme` on mount and sets `class="dark"` on `<html>` — no third-party library). Export metadata with title "DST Recipe Browser". | frontend-designer | P3-02 | todo | |
| P3-04 | frontend-designer | Write `frontend/lib/types.ts`. Export TypeScript interfaces mirroring the Pydantic schemas exactly: `Ingredient`, `RecipeIngredient`, `Recipe` (which includes `ingredients: RecipeIngredient[]`), `FavoriteIn`, `FavoriteOut`. | frontend-designer | P3-01 | todo | |
| P3-05 | frontend-designer | Write `frontend/lib/api.ts`. Export typed async fetch functions (server-side, uses `process.env.API_URL`): `getRecipes(params: RecipeQueryParams): Promise<Recipe[]>`, `getRecipe(slug: string): Promise<Recipe>`, `getIngredients(): Promise<Ingredient[]>`, `simulateRecipes(ingredientIds: number[]): Promise<Recipe[]>`. All functions should throw on non-OK responses. Define `RecipeQueryParams` interface with all filter fields as optional. | frontend-designer | P3-04 | todo | |
| P3-06 | frontend-designer | Write `frontend/lib/favorites.ts`. Export: `getClientId(): string` — reads `localStorage.getItem("dst_client_id")`, creates and stores a new `crypto.randomUUID()` if absent. Export `getFavorites(clientId: string): Promise<number[]>` — fetches `GET /api/favorites?client_id=<id>`. Export `toggleFavorite(clientId: string, recipeId: number, isFav: boolean): Promise<void>` — POST or DELETE to `/api/favorites`. | frontend-designer | P3-04 | todo | Uses `/api/favorites` (Next.js route handler proxy), not FastAPI directly |
| P3-07 | devops-config-manager | Write `frontend/app/api/favorites/route.ts`. Implement GET, POST, DELETE route handlers that proxy to `process.env.API_URL/favorites`, forwarding query params and body as-is. This keeps the FastAPI URL server-side only. | devops-config-manager | P3-01 | todo | |

---

## Phase 4 — Frontend Components

| Task ID | Workstream | Task Description | Owner | Depends On | Status | Notes |
|---------|-----------|-----------------|-------|-----------|--------|-------|
| P4-01 | frontend-designer | Write `frontend/components/StatBar.tsx`. Props: `label: string`, `value: number`, `icon: string` (path to health/hunger/sanity meter PNG). Display icon + numeric value. Handle negative values (show in red). | frontend-designer | P3-02 | todo | |
| P4-02 | frontend-designer | Write `frontend/components/FavoriteButton.tsx`. Client Component. Props: `recipeId: number`, `initialIsFav: boolean`. Manages optimistic toggle state. On click: calls `toggleFavorite` from `favorites.ts`, updates local state immediately, reverts on error. Renders a star icon (filled/outline) styled with dst-gold color. | frontend-designer | P3-06 | todo | |
| P4-03 | frontend-designer | Write `frontend/components/IngredientSlot.tsx`. Props: `ingredient: RecipeIngredient | null`. Renders ingredient image (40×40, rounded) + quantity label if ingredient is provided; renders a placeholder slot outline if null. Uses `next/image`. | frontend-designer | P3-04 | todo | |
| P4-04 | frontend-designer | Write `frontend/components/RecipeCard.tsx`. Client Component (needs FavoriteButton). Props: `recipe: Recipe`, `isFav: boolean`. Displays: dish image (next/image, 80×80), dish name (font-dst), stat bars (StatBar ×3), up to 4 ingredient slots (IngredientSlot), FavoriteButton, a link to `/recipes/[slug]`. If `recipe.warly === true`, apply `bg-warly-pink dark:bg-warly-pink/20` background tint and show a "Warly only" badge. | frontend-designer | P4-01, P4-02, P4-03 | todo | |
| P4-05 | frontend-designer | Write `frontend/components/RecipeModal.tsx`. Client Component using native `<dialog>` element. Props: `recipe: Recipe | null`, `onClose: () => void`. Shows full recipe detail: large dish image, all stats, full ingredients list with quantities, note, character_note, a share button that copies `/recipes/[recipe.slug]` to clipboard, and a close button. Opens via `dialogRef.current.showModal()` when recipe prop is non-null. | frontend-designer | P4-01, P4-03 | todo | |
| P4-06 | frontend-designer | Write `frontend/components/Banner.tsx`. Client Component. Props: `search: string`, `sort: string`, `warly: boolean`, `onSearchChange`, `onSortChange`, `onWarlyChange`, `onThemeToggle`. Renders: app title in font-dst, search input, sort dropdown (health/hunger/sanity/alphabet), Warly checkbox, dark/light toggle button. All change handlers call the passed-in callbacks (parent manages URL state). | frontend-designer | P3-02 | todo | |
| P4-07 | frontend-designer | Write `frontend/components/FilterPanel.tsx`. Client Component. Props: `ingredients: Ingredient[]`, `selectedIngredientIds: number[]`, `minHealth: number`, `minHunger: number`, `minSanity: number`, and onChange callbacks for each. Renders: multi-select ingredient picker (show ingredient image + name for each of the 39 ingredients, allow toggling), three range sliders (min health/hunger/sanity, range 0–200). Calls callbacks on each change so parent can update URL params. | frontend-designer | P3-04 | todo | |
| P4-08 | frontend-designer | Write `frontend/components/RecipeGrid.tsx`. Client Component. This is the main interactive shell for the home page. Receives `initialRecipes: Recipe[]`, `ingredients: Ingredient[]`, `initialFavIds: number[]` as props from the Server Component. Manages all filter/sort state in URL via `useSearchParams` + `router.replace()`. On param change: fetches updated recipe list from `GET /api/recipes` proxy (or directly from `lib/api.ts` via a client-side fetch). Renders `Banner`, `FilterPanel`, and the grid of `RecipeCard` components. Handles loading state during re-fetch. | frontend-designer | P4-04, P4-06, P4-07 | todo | URL param keys: `search`, `sort`, `warly`, `min_health`, `min_hunger`, `min_sanity`, `ingredient_ids` (comma-separated) |
| P4-09 | frontend-designer | Write `frontend/components/CrockpotSim.tsx`. Client Component. Renders 4 ingredient slot dropdowns, each populated from `GET /ingredients` (passed as prop). User can select one ingredient per slot or leave it empty. On any slot change: call `GET /recipes/simulate?ingredient_ids=...` (only include non-empty slots). Render matching recipe names + dish images below. Show "No matches" if result is empty. Show "Select at least one ingredient" if all slots are empty. | frontend-designer | P3-04, P3-05 | todo | Whether empty slots act as wildcards is a pending clarification — see questions at bottom |

---

## Phase 5 — Pages & Routing

| Task ID | Workstream | Task Description | Owner | Depends On | Status | Notes |
|---------|-----------|-----------------|-------|-----------|--------|-------|
| P5-01 | frontend-designer | Write `frontend/app/page.tsx` (Server Component). Read URL `searchParams` and pass to `getRecipes()`. Fetch ingredients via `getIngredients()`. Fetch initial favorite IDs by reading `client_id` cookie (or skip server-side — pass `initialFavIds={[]}` and let client hydrate). Export `revalidate = 3600`. Render `<CrockpotSim ingredients={ingredients} />` above `<RecipeGrid initialRecipes={recipes} ingredients={ingredients} initialFavIds={[]} />`. | frontend-designer | P4-08, P4-09 | todo | Favorites cannot be server-fetched (no cookie/UUID on first render) — pass empty array and hydrate client-side in RecipeGrid useEffect |
| P5-02 | frontend-designer | Write `frontend/app/loading.tsx`. Simple skeleton grid of 12 placeholder recipe card outlines using Tailwind `animate-pulse`. | frontend-designer | P3-02 | todo | |
| P5-03 | frontend-designer | Write `frontend/app/recipes/[slug]/page.tsx` (Server Component). Call `getRecipe(params.slug)`, render full recipe detail: large image, all stats, full ingredient list, note, character_note, share button (Client Component island). Add `generateStaticParams` that calls `getRecipes({})` and maps slugs for static pre-rendering at build time. Export `revalidate = 3600`. | frontend-designer | P3-05 | todo | |

---

## Phase 6 — Theme & Polish

| Task ID | Workstream | Task Description | Owner | Depends On | Status | Notes |
|---------|-----------|-----------------|-------|-----------|--------|-------|
| P6-01 | frontend-designer | Implement dark/light theme toggle. The `ThemeProvider` (written in P3-03) reads `localStorage.getItem("dst_theme")` on mount (via `useEffect`) and sets `document.documentElement.classList.toggle("dark", value === "dark")`. Default is dark. The toggle button in `Banner` calls `onThemeToggle` which flips the stored value and updates the class. Ensure all components use `dark:` Tailwind variants for background and text. | frontend-designer | P3-03, P4-06 | todo | |
| P6-02 | frontend-designer | DST visual polish pass. Apply across all components: (1) `bg-frame` on RecipeCard borders or modal header. (2) `font-dst` on dish names and headings. (3) `text-dst-gold` on stat values and headings. (4) `bg-dst-brown` card backgrounds in light mode, `bg-dst-dark` in dark mode. (5) `text-dst-parchment` body text in dark mode. (6) Warly card tint and badge. (7) Hover states on cards (subtle gold border). | frontend-designer | P6-01 | todo | |

---

## Phase 7 — QA

| Task ID | Workstream | Task Description | Owner | Depends On | Status | Notes |
|---------|-----------|-----------------|-------|-----------|--------|-------|
| P7-01 | qa-qc-inspector | Backend API verification. With `uvicorn` running on port 8000, test all endpoints: `GET /health` → 200 `{"status":"ok"}`, `GET /ingredients` → 39 items, `GET /recipes` → 73 items with `ingredients` array, `GET /recipes?search=meat` → at least Meatballs + Meaty Stew, `GET /recipes?warly=true` → exactly 10 Warly recipes, `GET /recipes?sort=health` → sorted descending by health value, `GET /recipes?min_health=40` → all results have health ≥ 40, `GET /recipes/simulate?ingredient_ids=<Meats_id>` → Meatballs + Meaty Stew + others with only Meats, `GET /recipes/meatballs` → slug works, `POST /favorites` + `GET /favorites` + `DELETE /favorites` roundtrip. Document any failures. | qa-qc-inspector | P2-08 | todo | |
| P7-02 | qa-qc-inspector | Frontend feature verification. With both servers running: (1) Home page loads with recipe grid. (2) Search input filters cards live on URL change. (3) Sort dropdown re-orders cards. (4) Warly checkbox shows only Warly recipes when checked. (5) Ingredient filter returns only recipes containing selected ingredients. (6) Stat sliders filter correctly. (7) Favorite star toggles and persists after page refresh. (8) `/recipes/meatballs` loads and renders correctly. (9) Crock Pot Simulator: selecting Meats + Honey returns Honey Ham. (10) Dark/light toggle persists after refresh. (11) RecipeModal opens on card click, share button copies URL. (12) `loading.tsx` skeleton appears briefly on slow connections (test with network throttle). Document failures. | qa-qc-inspector | P5-01, P5-02, P5-03, P6-02 | todo | |
| P7-03 | qa-qc-inspector | Image asset verification. Confirm: all 39 ingredient PNGs load in FilterPanel and on RecipeCards. All dish PNGs load on RecipeCards (for the 39 recipes with known dish filenames). `any.png` is present at `/image/any.png` and accessible. Puffed Potato Souffle has its corrected filename. Report any broken image paths. | qa-qc-inspector | P0-03, P5-01 | todo | |

---

## Reference: Ingredient Name → Image Path Mapping

The seed script must use this exact mapping (derived from `index.js`). Variable name = Data.js import alias, PNG filename = actual file.

| Data.js Variable | Ingredient Name (DB) | image_path |
|-----------------|---------------------|------------|
| Meats | Meats | /ingredients/Meats.png |
| Eggs | Eggs | /ingredients/Eggs.png |
| Asparaguses | Asparaguses | /ingredients/Asparaguses.png |
| Cactus_Flesh | Cactus Flesh | /ingredients/Cactus_Flesh.png |
| Cactus_Flower | Cactus Flower | /ingredients/Cactus_Flower.png |
| Cave_Bananas | Cave Bananas | /ingredients/Cave_Bananas.png |
| Corns | Corns | /ingredients/Corns.png |
| Dairy_product | Dairy Product | /ingredients/Dairy_product.png |
| Dragon_Fruits | Dragon Fruits | /ingredients/Dragon_Fruits.png |
| Drumstick | Drumstick | /ingredients/Drumstick.png |
| Fishes | Fishes | /ingredients/Fishes.png |
| ForgetMeLots | Forget-Me-Lots | /ingredients/Forget-Me-Lots.png |
| Frog_Leg | Frog Leg | /ingredients/Frog_Leg.png |
| Fruit | Fruit | /ingredients/Fruit.png |
| Garlics | Garlics | /ingredients/Garlics.png |
| Honey | Honey | /ingredients/Honey.png |
| Ice | Ice | /ingredients/Ice.png |
| Kelp_Fronds | Kelp Fronds | /ingredients/Kelp_Fronds.png |
| LeafyMeats | Leafy Meats | /ingredients/Leafy_Meats.png |
| Moleworm | Moleworm | /ingredients/Moleworm.png |
| NakedNostrils | Naked Nostrils | /ingredients/Naked_Nostrils.png |
| Potatoes | Potatoes | /ingredients/Potatoes.png |
| Ripe_Stone_Fruit | Ripe Stone Fruit | /ingredients/Ripe_Stone_Fruit.png |
| RoyalJelly | Royal Jelly | /ingredients/Royal_Jelly.png |
| Twigs | Twigs | /ingredients/Twigs.png |
| Watermelon | Watermelon | /ingredients/Watermelon.png |
| Wobster | Wobster | /ingredients/Wobster.png |
| Butter | Butter | /ingredients/Butter.png |
| Cooked_Mussel | Cooked Mussel | /ingredients/Cooked_Mussel.png |
| Limpets | Limpets | /ingredients/Limpets.png |
| Jellyfish | Jellyfish | /ingredients/Jellyfish.png |
| Butterfly_Wings | Butterfly Wings | /ingredients/Butterfly_Wings.png |
| Vegetables | Vegetables | /ingredients/Vegetables.png |
| Barnacle | Barnacle | /ingredients/Barnacle.png |
| Tallbird_Egg | Tallbird Egg | /ingredients/Tallbird_Egg.png |
| Bone_Shards | Bone Shards | /ingredients/Bone_Shards.png |
| Onions | Onions | /ingredients/Onions.png |
| Glow_Berry | Glow Berry | /ingredients/Glow_Berry.png |
| Volt_Goat_Horn | Volt Goat Horn | /ingredients/Volt_Goat_Horn.png |

**Total: 39 ingredients.** Jellyfish is imported in Data.js but used in zero recipe entries — insert it as an ingredient row with no recipe_ingredient rows.

---

## Reference: Data.js Recipe → Ingredient Mapping Notes

The seed script must parse the recipe-ingredient relationships from `Data.js` at `/Users/mac19/Projects/Project04_DST_cooking_recipe/src/data/Data.js`. The file cannot be imported directly (it's ES module JSX) — the seed script must either: (a) embed the data as a Python dict literal, or (b) use a pre-extracted JSON file. Option (a) is recommended for simplicity.

Key mapping quirks to handle in the seed script:
- `Dragonpie` recipe uses `[Dragonpie, 1]` as its ingredient — this is the dish icon, not an ingredient. The actual ingredient is `Dragon Fruits`. The data-engineer must substitute `Dragon_Fruits` for this entry.
- Some recipes in Data.js have no `dish` key (e.g., Beefy Greens, Tall Scotch Eggs, Dragonpie) — match them to `data.json` entries by hunger/sanity/health values.
- Stats in Data.js may differ from data.json (Data.js is the more accurate source for stats — e.g., Meatballs shows hunger=62.5 in Data.js vs 37.5 in data.json). The seed script should use **data.json as the canonical source for recipe rows** and Data.js only for ingredient relationships. Do not update recipe stats from Data.js.
- Recipes in Data.js that have no matching entry in data.json (e.g., `Bisque`, `Lobster_Bisque`, `Lobster_Dinner`, `Caviar`, `Coffee`, `JellyO_Pop`, `Mussel_Bouillabaise`, `Shark_Fin_Soup`, `Barnacle_Linguine`) — these dish icons appear in index.js but the recipes do not exist in data.json. Skip their ingredient rows (no recipe row to attach to). Do not add new recipes not in data.json.
- `Surf_27_Turf` in Data.js maps to "surf'n'turf" in data.json.

---

## Open Questions for User

See bottom of this file — questions are surfaced in the PM's response to the user, not stored here.
