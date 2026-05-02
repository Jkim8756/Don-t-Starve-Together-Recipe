# QA Report — DST Recipe Browser
**Date:** 2026-05-01  
**Tested by:** qa-qc-inspector  

---

## ✅ Passing Tests

| Test | Result |
|------|--------|
| `GET /recipes` — returns 77 recipes | ✅ 77 recipes |
| `GET /recipes?search=honey` | ✅ Returns Honey Ham, Honey Nuggets |
| `GET /recipes?warly=true` | ✅ 11 Warly recipes |
| `GET /recipes?sort=health` — highest health first | ✅ Jelly Beans (122), Mandrake Soup (100) |
| `GET /recipes?min_health=100` | ✅ Returns 2 recipes, both ≥ 100 health |
| `GET /recipes?ingredient_ids=27` (Meats) — all results contain Meats | ✅ 10 recipes, all verified |
| `GET /recipes/meatballs` — correct stats & ingredients | ✅ hunger=37.5, [Meats ×0.5] |
| `GET /recipes/nonexistent-slug` — 404 | ✅ |
| Dragonpie ingredient is Dragon_Fruits (not dish icon) | ✅ Fixed in seed script |
| Taffy hunger uses data.json value (25, not 26) | ✅ |
| Taffy ingredients: [Honey ×3] | ✅ |
| `GET /ingredients` — 40 ingredients | ✅ |
| Favorites POST → GET → DELETE → GET | ✅ All 4 steps pass |
| Next.js build: zero TypeScript errors | ✅ |
| `/image/any.png` fallback for recipes without dish image | ✅ Applied |
| Ingredient names formatted (underscores → spaces) in all display contexts | ✅ Applied via `formatIngredientName()` |

---

## ❌ Bugs Found & Fixed

| # | Severity | Area | Description | Fix Applied |
|---|----------|------|-------------|-------------|
| 1 | CRITICAL | Backend | `GET/DELETE /favorites` returned 500: PostgreSQL `uuid = character varying` operator mismatch — `Favorite.client_id` was `Mapped[str]` but column is UUID type | Rewrote favorites router to use raw SQL with Python `uuid.UUID` objects so asyncpg handles type mapping correctly |
| 2 | HIGH | Frontend→Backend | `DELETE /api/favorites` proxy returned 422: Next.js route forwarded JSON body to FastAPI, but FastAPI DELETE expects query params | Fixed `app/api/favorites/route.ts` to extract `client_id`/`recipe_id` from body and forward as URL query params |
| 3 | HIGH | Frontend | `RecipeCard`, `RecipeModal`, `CrockpotSim`: `<Image src={recipe.image_path}>` with empty string crashes for 40 recipes that have no dish image | Added `|| "/image/any.png"` fallback in all 3 components |

---

## ⚠️ Code Quality Issues (for agent follow-up)

| # | Severity | Area | Description | File |
|---|----------|------|-------------|------|
| Q1 | MEDIUM | Frontend | Raw hex values (`#3d2b1f`, `#c8a84b`, `#1a1208`, `#e8d5b0`) hardcoded in Tailwind classes throughout components instead of CSS variables defined in `globals.css`. Design token system exists but isn't wired to component classes. | `RecipeCard.tsx`, `RecipeGrid.tsx`, `CrockpotSim.tsx`, `RecipeModal.tsx`, `FilterPanel.tsx` |
| Q2 | MEDIUM | Frontend | `style={{ fontFamily: "var(--font-dst), serif" }}` repeated as inline style in 4+ components instead of a reusable Tailwind class. `globals.css` defines `--font-dst` but the font utility class isn't applied consistently. | `RecipeCard.tsx`, `RecipeGrid.tsx`, `CrockpotSim.tsx`, `Banner.tsx` |
| Q3 | MEDIUM | Backend | `database.py` SSL context uses `CERT_NONE` (no certificate verification) — acceptable for local dev but must be replaced with proper cert verification before any production deployment. | `backend/app/database.py:17` |
| Q4 | LOW | Backend | `fetchAllRecipeSlugs()` fetches ALL 77 recipes just to extract slugs for `generateStaticParams` — unnecessary data transfer. Add a dedicated `GET /recipes/slugs` endpoint that returns only `[{slug}]`. | `frontend/lib/api.ts`, `backend/app/routers/recipes.py` |
| Q5 | LOW | Frontend | `RecipeGrid` empty state references `/icons/rot.png` which does exist, but is an undocumented icon. If it's removed, the empty state silently breaks. Should be moved to a constant. | `RecipeGrid.tsx:210` |
| Q6 | LOW | Data | 40 of 77 recipes have no `image_path` (empty string) because dish images don't exist for newer/less-common recipes. These show the generic `any.png` fallback. Future improvement: source or create missing dish images. | `backend/app/seed/seed.py` |
| Q7 | LOW | Frontend | `RecipeModal`'s share button copies the URL to clipboard but there is no visual confirmation (toast/snackbar) that the copy succeeded. | `RecipeModal.tsx` |

---

## 📋 Agent Task Assignments

### frontend-designer — fix Q1 and Q2 (design consistency)

**Q1 fix:** In `frontend/app/globals.css`, verify that `@theme` tokens define CSS variables for all DST colors. Then replace all raw hex literals in component Tailwind classes with the CSS variable references:
- `bg-[#3d2b1f]` → `bg-dst-brown`
- `text-[#c8a84b]` → `text-dst-gold`
- `bg-[#1a1208]` → `bg-dst-dark`
- `text-[#e8d5b0]` → `text-dst-parchment`

Files: `RecipeCard.tsx`, `RecipeGrid.tsx`, `CrockpotSim.tsx`, `RecipeModal.tsx`, `FilterPanel.tsx`, `Banner.tsx`

**Q2 fix:** Add a `font-dst` utility class in Tailwind config / globals.css and replace all `style={{ fontFamily: "var(--font-dst), serif" }}` inline styles with `className="font-dst"`.

Files: `RecipeCard.tsx`, `RecipeGrid.tsx`, `CrockpotSim.tsx`, `Banner.tsx`, `RecipeModal.tsx`

After changes, run `npm run build` to verify zero TypeScript errors.

---

### backend-data-processor — fix Q4 (slugs endpoint)

Add a dedicated endpoint to `backend/app/routers/recipes.py`:

```python
@router.get("/slugs", response_model=list[str])
async def list_slugs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Recipe.slug))
    return result.scalars().all()
```

**IMPORTANT:** Place this route BEFORE `@router.get("/{slug}")` so `/slugs` is not treated as a slug value.

Then update `frontend/lib/api.ts`:
```typescript
export async function fetchAllRecipeSlugs(): Promise<string[]> {
  const res = await fetch(`${BASE}/recipes/slugs`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}
```

---

### frontend-designer — fix Q7 (share button confirmation)

In `RecipeModal.tsx`, after `navigator.clipboard.writeText(url)` succeeds, show a brief "Copied!" message next to the share button. Use a local `useState<boolean>` that resets after 2 seconds via `setTimeout`.

---

## Summary

**3 bugs fixed during this QA pass** (1 critical, 2 high). All API endpoints now pass. Build is clean. The app is functional end-to-end. Remaining issues are code quality/polish items for agent follow-up.
