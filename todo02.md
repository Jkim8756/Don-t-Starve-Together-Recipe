# QA Report — DST Recipe Browser
**Date:** 2026-05-01  
**Tested by:** frontend-designer + manual API verification  
**Previous report:** todo01.md

---

## ✅ Fixes Applied Since todo01.md

| # | Area | Fix |
|---|------|-----|
| Q1 | Frontend | All raw hex color values (`#3d2b1f`, `#c8a84b`, `#1a1208`, `#e8d5b0`, `#f9a825`) replaced with Tailwind design token classes (`dst-brown`, `dst-gold`, `dst-dark`, `dst-parchment`, `warly-accent`) across all components and pages |
| Q2 | Frontend | All `style={{ fontFamily: "var(--font-dst), serif" }}` inline styles removed; replaced with `font-dst` Tailwind utility class |
| Q4 | Backend + Frontend | `GET /recipes/slugs` endpoint added to `recipes.py` (before `/{slug}` to avoid route collision); `fetchAllRecipeSlugs()` in `api.ts` now calls this lightweight endpoint instead of fetching all 77 full recipe objects |
| Q7 | Frontend | Share button in `RecipeModal` now shows "Copied!" for 2 seconds after clipboard write succeeds (via `useState<boolean>` + `setTimeout`) |

**Additional fixes discovered during this pass:**

| # | Area | Fix |
|---|------|-----|
| A1 | Frontend | `app/recipes/[slug]/page.tsx` was missed in Q1/Q2 pass — all hex values and inline font styles fixed |
| A2 | Frontend | `app/loading.tsx` was missed in Q1/Q2 pass — all hex skeleton colors replaced with token classes |
| A3 | Frontend | `app/recipes/[slug]/page.tsx` missing `|| "/image/any.png"` fallback on `recipe.image_path` (same class of bug as todo01 Bug #3) — fixed |
| A4 | Frontend | `app/recipes/[slug]/page.tsx` ingredient names displayed raw (e.g. "Bone_Shards") — `formatIngredientName()` now applied |

---

## ✅ API Tests — All Passing

| Test | Result |
|------|--------|
| `GET /recipes` — 77 recipes | ✅ |
| `GET /recipes?search=honey` | ✅ Returns Honey Ham, Honey Nuggets |
| `GET /recipes?warly=true` | ✅ 11 recipes |
| `GET /recipes?sort=health` | ✅ Jelly Beans (122), Mandrake Soup (100) |
| `GET /recipes/slugs` — new endpoint | ✅ 77 slugs returned |
| `GET /recipes/meatballs` | ✅ hunger=37.5, ingredients=[Meats] |
| `GET /recipes/nonexistent` | ✅ 404 |
| `GET /ingredients` — 40 ingredients | ✅ |
| `GET /recipes/simulate?ingredient_ids=27` | ✅ 2 results: Meatballs, Meaty Stew |
| Favorites POST → GET → DELETE → GET | ✅ All 4 steps pass |

---

## ✅ Build Verification

| Check | Result |
|-------|--------|
| `npm run build` — TypeScript errors | ✅ Zero errors |
| Static pages generated | ✅ 82 pages |
| Compiled successfully | ✅ 7.9s |
| No raw hex values remaining in `components/` | ✅ Verified |
| No raw hex values remaining in `app/` | ✅ Verified |
| No inline `fontFamily` styles remaining | ✅ Verified |

---

## ⚠️ Remaining Issues

| # | Severity | Area | Description | File |
|---|----------|------|-------------|------|
| R1 | MEDIUM | Backend | `database.py` SSL context uses `CERT_NONE` (no certificate verification) — acceptable for local dev, must be replaced with proper cert verification before any production deployment | `backend/app/database.py:17` |
| R2 | LOW | Frontend | `RecipeGrid` empty-state references `/icons/rot.png` as a hardcoded string — if the file is removed, the empty state silently breaks. Should be extracted to a named constant | `RecipeGrid.tsx:255` |
| R3 | LOW | Data | 40 of 77 recipes have no `image_path` (show generic `any.png` fallback). Dish images don't exist for newer/less-common recipes. Future: source or create missing dish images | `backend/app/seed/seed.py` |
| R4 | LOW | Frontend | `/recipes/[slug]` page shows as `ƒ` (dynamic) in Next.js build output instead of `●` (SSG) due to `dynamicParams = true`. This is intentional fallback behavior but means uncached slug requests hit the server. Could set `dynamicParams = false` to enforce build-time-only slugs | `app/recipes/[slug]/page.tsx:8` |

---

## 📋 Agent Task Assignments

### backend-data-processor — fix R1 (SSL cert verification)

In `backend/app/database.py`, replace the `CERT_NONE` development workaround with proper SSL verification for production. The current code:

```python
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE
```

Should be replaced with environment-aware logic:

```python
import os
_is_prod = os.getenv("ENV", "development") == "production"
if _is_prod:
    _ssl_ctx = ssl.create_default_context()  # uses system CA bundle
else:
    _ssl_ctx = ssl.create_default_context()
    _ssl_ctx.check_hostname = False
    _ssl_ctx.verify_mode = ssl.CERT_NONE
```

Add `ENV=production` to the backend `.env` before any deployment.

---

### frontend-designer — fix R2 (rot.png constant)

In `RecipeGrid.tsx`, extract the hardcoded `/icons/rot.png` path into a module-level constant at the top of the file:

```typescript
const EMPTY_STATE_ICON = "/icons/rot.png";
```

Replace the usage on approximately line 255 with the constant reference.

---

## Summary

**All 4 quality issues from todo01.md resolved** (Q1, Q2, Q4, Q7). **4 additional issues found and fixed** during this pass (A1–A4: slug page and loading skeleton missed in initial Q1/Q2 sweep, plus two bugs on the slug page). Build is clean at 82 static pages. App is fully functional end-to-end. Remaining issues are all low-severity polish or deployment-readiness items.
