"use client";

import { useState } from "react";
import { useFilters } from "@/lib/hooks/useFilters";
import { useFavorites } from "@/lib/hooks/useFavorites";
import Banner from "./Banner";
import FilterPanel from "./FilterPanel";
import RecipeCard from "./RecipeCard";
import RecipeModal from "./RecipeModal";
import CrockpotSim from "./CrockpotSim";
import Image from "next/image";
import type { Recipe, Ingredient } from "@/lib/types";

interface RecipeGridProps {
  initialRecipes: Recipe[];
  ingredients: Ingredient[];
}

const EMPTY_STATE_ICON = "/icons/rot.png";

export default function RecipeGrid({ initialRecipes, ingredients }: RecipeGridProps) {
  const filters = useFilters(initialRecipes);
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  // Mobile filter panel toggle
  const [showFilters, setShowFilters] = useState(false);

  // Shared FilterPanel + CrockpotSim props extracted for DRY rendering in both
  // the mobile collapsible and the desktop sidebar.
  const filterPanelProps = {
    search: filters.search,
    onSearchChange: filters.setSearch,
    sort: filters.sort,
    onSortChange: filters.setSort,
    ingredients,
    selectedIngredients: filters.ingredientFilter,
    onIngredientChange: filters.setIngredientFilter,
    minHealth: filters.minHealth,
    onMinHealthChange: filters.setMinHealth,
    minHunger: filters.minHunger,
    onMinHungerChange: filters.setMinHunger,
    minSanity: filters.minSanity,
    onMinSanityChange: filters.setMinSanity,
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky banner */}
      <Banner
        warly={filters.warly}
        onWarlyChange={filters.setWarly}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Mobile: "Filters & Sort" toggle button — hidden on md+ */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dst-brown/60 border border-dst-gold/30 text-dst-parchment text-sm hover:border-dst-gold transition-colors w-full justify-center"
            aria-expanded={showFilters}
            aria-controls="mobile-filter-panel"
          >
            <svg
              className="w-4 h-4 text-dst-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
            {showFilters ? "Hide Filters" : "Filters & Sort"}
          </button>
        </div>

        {/* Mobile collapsible filter panel — hidden on md+ */}
        {showFilters && (
          <div id="mobile-filter-panel" className="md:hidden flex flex-col gap-4 mb-6">
            <FilterPanel {...filterPanelProps} />
            <CrockpotSim ingredients={ingredients} />
          </div>
        )}

        {/* Main layout: filter sidebar + recipe grid */}
        <div className="flex gap-6 items-start">
          {/* Sidebar: FilterPanel + CrockpotSim — hidden on mobile, visible md+ */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:w-56 lg:w-64 xl:w-72 shrink-0">
            <FilterPanel {...filterPanelProps} />
            <CrockpotSim ingredients={ingredients} />
          </div>

          {/* Recipe grid area */}
          <div className="flex-1 min-w-0">
            {/* Status bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-dst-parchment/50">
                {filters.loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-dst-gold/40 border-t-dst-gold rounded-full animate-spin inline-block" />
                    Loading...
                  </span>
                ) : (
                  `${filters.recipes.length} recipe${filters.recipes.length !== 1 ? "s" : ""}`
                )}
              </p>
              {favorites.size > 0 && (
                <p className="text-xs text-dst-gold/70">
                  {favorites.size} favorited
                </p>
              )}
            </div>

            {/* Error state */}
            {filters.error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
                {filters.error}
                <button
                  onClick={filters.clearError}
                  className="ml-3 underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Empty state */}
            {!filters.loading && filters.recipes.length === 0 && !filters.error && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Image
                  src={EMPTY_STATE_ICON}
                  alt="No results"
                  width={64}
                  height={64}
                  className="opacity-40 mb-4"
                />
                <p className="text-xl text-dst-parchment/50 mb-2 font-dst">
                  No Recipes Found
                </p>
                <p className="text-sm text-dst-parchment/30">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}

            {/* Recipe cards */}
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              role="list"
              aria-label="Recipe list"
              aria-busy={filters.loading ? "true" : "false"}
            >
              {filters.recipes.map((recipe) => (
                <div key={recipe.id} role="listitem">
                  <RecipeCard
                    recipe={recipe}
                    isFavorite={favorites.has(recipe.id)}
                    onFavoriteToggle={toggleFavorite}
                    onOpenModal={setSelectedRecipe}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe detail modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isFavorite={selectedRecipe ? favorites.has(selectedRecipe.id) : false}
        onFavoriteToggle={toggleFavorite}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
