"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Recipe } from "@/lib/types";
import { CLIENT_API_BASE } from "@/lib/api";

export interface FilterState {
  search: string;
  setSearch: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  warly: boolean | null;
  setWarly: (v: boolean | null) => void;
  minHealth: number;
  setMinHealth: (v: number) => void;
  minHunger: number;
  setMinHunger: (v: number) => void;
  minSanity: number;
  setMinSanity: (v: number) => void;
  ingredientFilter: number[];
  setIngredientFilter: (v: number[]) => void;
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useFilters(initialRecipes: Recipe[]): FilterState {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "alphabet");
  const [warly, setWarly] = useState<boolean | null>(
    searchParams.get("warly") === "true" ? true : null
  );
  const [minHealth, setMinHealth] = useState(Number(searchParams.get("min_health") ?? -20));
  const [minHunger, setMinHunger] = useState(Number(searchParams.get("min_hunger") ?? 0));
  const [minSanity, setMinSanity] = useState(Number(searchParams.get("min_sanity") ?? -20));
  const [ingredientFilter, setIngredientFilter] = useState<number[]>(
    searchParams.get("ingredient_ids")
      ? searchParams.get("ingredient_ids")!.split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
      : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }

    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (sort && sort !== "alphabet") params.sort = sort;
    if (warly === true) params.warly = "true";
    if (minHealth > -20) params.min_health = String(minHealth);
    if (minHunger > 0) params.min_hunger = String(minHunger);
    if (minSanity > -20) params.min_sanity = String(minSanity);
    if (ingredientFilter.length > 0) params.ingredient_ids = ingredientFilter.join(",");

    const qs = new URLSearchParams(params).toString();
    router.replace(`/?${qs}`, { scroll: false });

    const controller = new AbortController();
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${CLIENT_API_BASE}/recipes${qs ? `?${qs}` : ""}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setRecipes(await res.json());
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Failed to load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, warly, minHealth, minHunger, minSanity, ingredientFilter]);

  return {
    search, setSearch, sort, setSort, warly, setWarly,
    minHealth, setMinHealth, minHunger, setMinHunger, minSanity, setMinSanity,
    ingredientFilter, setIngredientFilter,
    recipes, loading, error, clearError: () => setError(null),
  };
}
