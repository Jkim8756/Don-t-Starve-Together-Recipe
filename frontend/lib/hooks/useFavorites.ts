"use client";
import { useState, useEffect } from "react";
import { getClientId, getFavorites, addFavorite, removeFavorite } from "@/lib/favorites";

export interface FavoritesState {
  favorites: Set<number>;
  toggleFavorite: (id: number) => Promise<void>;
}

export function useFavorites(): FavoritesState {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const clientId = getClientId();
      getFavorites(clientId).then((ids) => setFavorites(new Set(ids)));
    } catch { /* localStorage unavailable */ }
  }, []);

  async function toggleFavorite(id: number) {
    try {
      const clientId = getClientId();
      if (favorites.has(id)) {
        await removeFavorite(clientId, id);
        setFavorites((prev) => { const next = new Set(prev); next.delete(id); return next; });
      } else {
        await addFavorite(clientId, id);
        setFavorites((prev) => new Set(prev).add(id));
      }
    } catch { /* silently fail */ }
  }

  return { favorites, toggleFavorite };
}
