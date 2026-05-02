const KEY = "dst-client-id";

export function getClientId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// Favorites calls go through the Next.js proxy at /api/favorites
const FAVORITES_BASE = "/api/favorites";

export async function getFavorites(clientId: string): Promise<number[]> {
  const res = await fetch(`${FAVORITES_BASE}?client_id=${clientId}`);
  if (!res.ok) return [];
  const data = await res.json();
  // API returns array of favorite objects or ids
  if (Array.isArray(data)) {
    return data.map((item: { recipe_id?: number } | number) =>
      typeof item === "number" ? item : item.recipe_id ?? 0
    );
  }
  return [];
}

export async function addFavorite(
  clientId: string,
  recipeId: number
): Promise<void> {
  await fetch(FAVORITES_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, recipe_id: recipeId }),
  });
}

export async function removeFavorite(
  clientId: string,
  recipeId: number
): Promise<void> {
  await fetch(FAVORITES_BASE, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, recipe_id: recipeId }),
  });
}
