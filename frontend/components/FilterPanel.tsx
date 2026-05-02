"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { Ingredient } from "@/lib/types";
import { formatIngredientName } from "@/lib/utils";

interface FilterPanelProps {
  search: string;
  onSearchChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  ingredients: Ingredient[];
  selectedIngredients: number[];
  onIngredientChange: (ids: number[]) => void;
  minHealth: number;
  onMinHealthChange: (val: number) => void;
  minHunger: number;
  onMinHungerChange: (val: number) => void;
  minSanity: number;
  onMinSanityChange: (val: number) => void;
}

export default function FilterPanel({
  search,
  onSearchChange,
  sort,
  onSortChange,
  ingredients,
  selectedIngredients,
  onIngredientChange,
  minHealth,
  onMinHealthChange,
  minHunger,
  onMinHungerChange,
  minSanity,
  onMinSanityChange,
}: FilterPanelProps) {
  // Debounce search input
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(val);
    }, 300);
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
  function toggleIngredient(id: number) {
    if (selectedIngredients.includes(id)) {
      onIngredientChange(selectedIngredients.filter((i) => i !== id));
    } else {
      onIngredientChange([...selectedIngredients, id]);
    }
  }

  function clearAll() {
    onSearchChange("");
    onSortChange("alphabet");
    onIngredientChange([]);
    onMinHealthChange(-20);
    onMinHungerChange(0);
    onMinSanityChange(-20);
  }

  const hasFilters =
    search.length > 0 ||
    sort !== "alphabet" ||
    selectedIngredients.length > 0 ||
    minHealth !== -20 ||
    minHunger !== 0 ||
    minSanity !== -20;

  return (
    <aside className="w-full">
      <div className="bg-dst-brown/60 border border-dst-gold/20 rounded-lg p-4 md:sticky md:top-[calc(var(--banner-height,72px)+1rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-dst-gold text-lg font-dst">
            Filters
          </h2>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-dst-parchment/60 hover:text-dst-gold underline transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sort select — at the top of the panel */}
        <div className="mb-4">
          <label className="block text-xs text-dst-parchment/60 uppercase tracking-wider mb-1.5">
            Sort by
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-dst-dark/80 border border-dst-gold/30 text-dst-parchment focus:outline-none focus:border-dst-gold transition-colors text-sm cursor-pointer"
            aria-label="Sort recipes"
          >
            <option value="alphabet">Alphabetical</option>
            <option value="health">Health (highest)</option>
            <option value="hunger">Hunger (highest)</option>
            <option value="sanity">Sanity (highest)</option>
          </select>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dst-gold/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search recipes..."
            defaultValue={search}
            onChange={handleSearchInput}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-dst-dark/80 border border-dst-gold/30 text-dst-parchment placeholder-dst-parchment/40 focus:outline-none focus:border-dst-gold transition-colors text-sm"
            aria-label="Search recipes"
          />
        </div>

        {/* Stat sliders */}
        <div className="space-y-4 mb-6">
          {/* Min Health */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="flex items-center gap-1 text-xs text-dst-parchment/80">
                <Image
                  src="/icons/Health_Meter.png"
                  alt="Health"
                  width={14}
                  height={14}
                />
                <span className="text-red-400">Min Health</span>
              </label>
              <span className="text-xs text-dst-gold font-mono">
                {minHealth >= 0 ? `+${minHealth}` : minHealth}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={100}
              step={1}
              value={minHealth}
              onChange={(e) => onMinHealthChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-full cursor-pointer"
              aria-label="Minimum health value"
            />
          </div>

          {/* Min Hunger */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="flex items-center gap-1 text-xs text-dst-parchment/80">
                <Image
                  src="/icons/Hunger_Meter.png"
                  alt="Hunger"
                  width={14}
                  height={14}
                />
                <span className="text-yellow-400">Min Hunger</span>
              </label>
              <span className="text-xs text-dst-gold font-mono">
                {minHunger}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={1}
              value={minHunger}
              onChange={(e) => onMinHungerChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-full cursor-pointer"
              aria-label="Minimum hunger value"
            />
          </div>

          {/* Min Sanity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="flex items-center gap-1 text-xs text-dst-parchment/80">
                <Image
                  src="/icons/Sanity_Meter.png"
                  alt="Sanity"
                  width={14}
                  height={14}
                />
                <span className="text-cyan-400">Min Sanity</span>
              </label>
              <span className="text-xs text-dst-gold font-mono">
                {minSanity >= 0 ? `+${minSanity}` : minSanity}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={50}
              step={1}
              value={minSanity}
              onChange={(e) => onMinSanityChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-full cursor-pointer"
              aria-label="Minimum sanity value"
            />
          </div>
        </div>

        {/* Ingredient multi-select */}
        <div>
          <h3 className="text-xs text-dst-parchment/60 uppercase tracking-wider mb-2">
            Required Ingredients
          </h3>
          {selectedIngredients.length > 0 && (
            <p className="text-xs text-dst-gold mb-2">
              {selectedIngredients.length} selected
            </p>
          )}
          <div className="max-h-48 md:max-h-72 overflow-y-auto space-y-1 pr-1">
            {ingredients.map((ing) => {
              const selected = selectedIngredients.includes(ing.id);
              return (
                <button
                  key={ing.id}
                  onClick={() => toggleIngredient(ing.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors ${
                    selected
                      ? "bg-dst-gold/20 border border-dst-gold/60 text-dst-gold"
                      : "border border-transparent text-dst-parchment/70 hover:bg-dst-brown hover:text-dst-parchment"
                  }`}
                  aria-pressed={selected}
                  aria-label={`${selected ? "Remove" : "Add"} ${ing.name} filter`}
                >
                  <Image
                    src={ing.image_path}
                    alt={ing.name}
                    width={20}
                    height={20}
                    className="shrink-0 object-contain"
                  />
                  <span className="truncate">{formatIngredientName(ing.name)}</span>
                  {selected && (
                    <svg
                      className="ml-auto shrink-0 w-3 h-3 text-dst-gold"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
