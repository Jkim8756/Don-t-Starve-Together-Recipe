import Image from "next/image";
import type { Recipe } from "@/lib/types";
import { formatIngredientName } from "@/lib/utils";
import StatPill from "./StatPill";

interface RecipeDetailProps {
  recipe: Recipe;
  /** Size variant for the dish image frame. Defaults to "md". */
  size?: "sm" | "md" | "lg";
}

export default function RecipeDetail({ recipe, size = "md" }: RecipeDetailProps) {
  const sortedIngredients = [...recipe.ingredients].sort((a, b) => a.slot_order - b.slot_order);

  const frameSizes = { sm: "w-20 h-20", md: "w-24 h-24", lg: "w-32 h-32" };
  const imgSizes =  { sm: 48,          md: 64,          lg: 80 };

  return (
    <div>
      {/* Dish image + name + warly badge + stats */}
      <div className="flex items-start gap-4 mb-5">
        <div className={`relative ${frameSizes[size]} shrink-0`}>
          <Image src="/image/frame.png" alt="" fill className="object-contain" aria-hidden="true" />
          <div className="absolute inset-2 flex items-center justify-center">
            <Image
              src={recipe.image_path || "/image/any.png"}
              alt={recipe.dish}
              width={imgSizes[size]}
              height={imgSizes[size]}
              className="object-contain drop-shadow-lg"
            />
          </div>
        </div>
        <div>
          <h2 className="text-2xl text-dst-gold leading-tight font-dst">{recipe.dish}</h2>
          {recipe.warly && (
            <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded bg-warly-accent/20 border border-warly-accent/50 text-warly-accent font-dst">
              Warly Exclusive
            </span>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <StatPill icon="/icons/Health_Meter.png" value={recipe.health} label="Health" color="text-red-400" />
            <StatPill icon="/icons/Hunger_Meter.png" value={recipe.hunger} label="Hunger" color="text-yellow-400" />
            <StatPill icon="/icons/Sanity_Meter.png" value={recipe.sanity} label="Sanity" color="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      {sortedIngredients.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs text-dst-parchment/50 uppercase tracking-wider mb-2">Ingredients</h3>
          <div className="grid grid-cols-2 gap-2">
            {sortedIngredients.map((slot) => (
              <div key={slot.slot_order} className="flex items-center gap-2 bg-dst-brown/60 rounded-lg px-3 py-2">
                <Image src={slot.image_path} alt={slot.name} width={28} height={28} className="object-contain shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-dst-parchment truncate">{formatIngredientName(slot.name)}</p>
                  <p className="text-xs text-dst-gold/70">×{slot.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {recipe.note && (
        <div className="mb-5">
          <h3 className="text-xs text-dst-parchment/50 uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-sm text-dst-parchment/80 leading-relaxed bg-dst-brown/40 rounded-lg p-3">{recipe.note}</p>
        </div>
      )}

      {/* Character note */}
      {recipe.character_note && (
        <div>
          <h3 className="text-xs text-dst-parchment/50 uppercase tracking-wider mb-2">Character Note</h3>
          <div className="flex gap-3 bg-warly-accent/5 border border-warly-accent/20 rounded-lg p-3">
            <Image src="/portraits/Maxwell_Portrait.png" alt="Maxwell" width={40} height={40} className="object-contain shrink-0 rounded" />
            <p className="text-sm text-dst-parchment/80 leading-relaxed italic">&ldquo;{recipe.character_note}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  );
}
