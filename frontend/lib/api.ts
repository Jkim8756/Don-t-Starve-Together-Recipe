import type { Recipe, Ingredient } from "./types";

export const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

const BASE = process.env.API_URL ?? "http://127.0.0.1:8001";

export async function fetchRecipes(
  params: Record<string, string>
): Promise<Recipe[]> {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/recipes${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch recipes: ${res.status}`);
  return res.json();
}

export async function fetchRecipe(slug: string): Promise<Recipe> {
  const res = await fetch(`${BASE}/recipes/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch recipe ${slug}: ${res.status}`);
  return res.json();
}

export async function fetchIngredients(): Promise<Ingredient[]> {
  const res = await fetch(`${BASE}/ingredients`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ingredients: ${res.status}`);
  return res.json();
}

export async function fetchAllRecipeSlugs(): Promise<string[]> {
  const res = await fetch(`${BASE}/recipes/slugs`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}
