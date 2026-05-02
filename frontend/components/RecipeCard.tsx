"use client";

import Image from "next/image";
import type { Recipe } from "@/lib/types";
import { formatIngredientName } from "@/lib/utils";
import StatPill from "./StatPill";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onFavoriteToggle: (id: number) => void;
  onOpenModal: (recipe: Recipe) => void;
}

export default function RecipeCard({
  recipe,
  isFavorite,
  onFavoriteToggle,
  onOpenModal,
}: RecipeCardProps) {
  // Sort ingredients by slot_order for consistent display
  const sortedIngredients = [...recipe.ingredients].sort(
    (a, b) => a.slot_order - b.slot_order
  );

  return (
    <article
      className="relative group flex flex-col bg-dst-brown/70 border border-dst-gold/20 rounded-lg p-4 cursor-pointer hover:border-dst-gold/60 hover:bg-dst-brown/90 transition-all duration-200 focus-within:border-dst-gold/60"
      onClick={() => onOpenModal(recipe)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenModal(recipe);
        }
      }}
      aria-label={`View ${recipe.dish} recipe details`}
    >
      {/* Favorite star button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle(recipe.id);
        }}
        className="absolute top-2 right-2 z-10 p-1 text-dst-gold hover:scale-110 transition-transform"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? (
          // Filled star
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ) : (
          // Outline star
          <svg
            className="w-5 h-5 opacity-40 group-hover:opacity-70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        )}
      </button>

      {/* Warly badge */}
      {recipe.warly && (
        <span
          className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-warly-accent/20 border border-warly-accent/50 text-warly-accent font-dst"
          title="Warly exclusive recipe"
        >
          Warly
        </span>
      )}

      {/* Dish image in frame */}
      <div className="flex justify-center mb-3 mt-1">
        <div className="relative w-20 h-20">
          {/* Frame background */}
          <Image
            src="/image/frame.png"
            alt=""
            fill
            className="object-contain"
            aria-hidden="true"
          />
          {/* Dish image — fallback to any.png for recipes without an image */}
          <div className="absolute inset-2 flex items-center justify-center">
            <Image
              src={recipe.image_path || "/image/any.png"}
              alt={recipe.dish}
              width={56}
              height={56}
              className="object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Dish name */}
      <h2
        className="text-center text-dst-parchment text-sm leading-tight mb-2 line-clamp-2 font-dst"
      >
        {recipe.dish}
      </h2>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-1 justify-center mb-3">
        <StatPill
          icon="/icons/Health_Meter.png"
          value={recipe.health}
          label="Health"
          color="text-red-400"
        />
        <StatPill
          icon="/icons/Hunger_Meter.png"
          value={recipe.hunger}
          label="Hunger"
          color="text-yellow-400"
        />
        <StatPill
          icon="/icons/Sanity_Meter.png"
          value={recipe.sanity}
          label="Sanity"
          color="text-cyan-400"
        />
      </div>

      {/* Ingredient slots — always render 4 positions */}
      <div className="flex gap-1 justify-center flex-wrap">
        {Array.from({ length: 4 }, (_, i) => sortedIngredients[i] ?? null).map(
          (slot, i) =>
            slot ? (
              <div
                key={slot.slot_order}
                className="relative flex flex-col items-center"
                title={`${formatIngredientName(slot.name)} ×${slot.quantity}`}
              >
                <div className="w-8 h-8 bg-dst-dark/60 border border-dst-gold/20 rounded flex items-center justify-center">
                  <Image
                    src={slot.image_path}
                    alt={slot.name}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-[9px] text-dst-parchment/50 mt-0.5">
                  ×{slot.quantity}
                </span>
              </div>
            ) : (
              <div key={`empty-${i}`} className="flex flex-col items-center">
                <div className="w-8 h-8 bg-dst-dark/40 border border-dst-gold/10 rounded" />
                <span className="text-[9px] text-dst-parchment/20 mt-0.5">—</span>
              </div>
            )
        )}
      </div>
    </article>
  );
}
