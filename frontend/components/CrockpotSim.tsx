"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Ingredient, Recipe } from "@/lib/types";
import { formatIngredientName } from "@/lib/utils";
import { CLIENT_API_BASE } from "@/lib/api";

interface CrockpotSimProps {
  ingredients: Ingredient[];
}

const EMPTY_SLOT = "";

export default function CrockpotSim({ ingredients }: CrockpotSimProps) {
  // 4 ingredient slot values — empty string means empty slot
  const [slots, setSlots] = useState<string[]>([
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT,
  ]);
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSlotChange(index: number, value: string) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  useEffect(() => {
    const filledIds = slots.filter((s) => s !== EMPTY_SLOT);
    const emptySlots = slots.filter((s) => s === EMPTY_SLOT).length;

    // Need at least one ingredient to simulate
    if (filledIds.length === 0) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function simulate() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          ingredient_ids: filledIds.join(","),
          empty_slots: String(emptySlots),
        });
        const res = await fetch(
          `${CLIENT_API_BASE}/recipes/simulate?${params}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: Recipe[] = await res.json();
        setResults(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Could not simulate — check your connection.");
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }

    simulate();
    return () => controller.abort();
  }, [slots]);

  const filledCount = slots.filter((s) => s !== EMPTY_SLOT).length;

  return (
    <div className="bg-dst-brown/60 border border-dst-gold/20 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Image
          src="/icons/crockpot.png"
          alt="Crock Pot"
          width={24}
          height={24}
          className="shrink-0"
        />
        <h2
          className="text-dst-gold text-base font-dst"
        >
          Crock Pot Simulator
        </h2>
      </div>

      {/* Slot selects */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {slots.map((slotValue, i) => (
          <div key={i} className="flex flex-col gap-1">
            <label className="text-xs text-dst-parchment/50">Slot {i + 1}</label>
            <div className="relative">
              {/* Ingredient image preview */}
              {slotValue !== EMPTY_SLOT && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none">
                  <Image
                    src={
                      ingredients.find((ing) => String(ing.id) === slotValue)
                        ?.image_path ?? ""
                    }
                    alt=""
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
              )}
              <select
                value={slotValue}
                onChange={(e) => handleSlotChange(i, e.target.value)}
                className={`w-full py-2 pr-2 rounded-lg bg-dst-dark/80 border border-dst-gold/20 text-dst-parchment text-xs focus:outline-none focus:border-dst-gold transition-colors cursor-pointer appearance-none ${
                  slotValue !== EMPTY_SLOT ? "pl-8" : "pl-3"
                }`}
                aria-label={`Ingredient slot ${i + 1}`}
              >
                <option value="">— empty —</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={String(ing.id)}>
                    {formatIngredientName(ing.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Status line */}
      <p className="text-xs text-dst-parchment/50 mb-3">
        {filledCount > 0
          ? `${filledCount} ingredient${filledCount > 1 ? "s" : ""}, ${4 - filledCount} empty slot${4 - filledCount !== 1 ? "s" : ""}`
          : "Fill at least one slot to simulate"}
      </p>

      {/* Results */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-dst-parchment/60">
          <div className="w-4 h-4 border-2 border-dst-gold/40 border-t-dst-gold rounded-full animate-spin" />
          Simulating...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && results.length > 0 && (
        <div>
          <p className="text-xs text-dst-parchment/50 mb-2">
            {results.length} possible recipe{results.length !== 1 ? "s" : ""}:
          </p>
          <div className="flex flex-wrap gap-2">
            {results.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center gap-2 bg-dst-dark/60 border border-dst-gold/20 rounded-lg px-2 py-1.5"
                title={recipe.dish}
              >
                <Image
                  src={recipe.image_path || "/image/any.png"}
                  alt={recipe.dish}
                  width={24}
                  height={24}
                  className="object-contain shrink-0"
                />
                <span className="text-xs text-dst-parchment">{recipe.dish}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && filledCount > 0 && results.length === 0 && (
        <p className="text-sm text-dst-parchment/50">
          No recipes match this combination.
        </p>
      )}
    </div>
  );
}
