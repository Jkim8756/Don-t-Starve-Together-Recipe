export interface IngredientSlot {
  ingredient_id: number;
  name: string;
  image_path: string;
  quantity: number;
  slot_order: number;
}

export interface Recipe {
  id: number;
  slug: string;
  dish: string;
  hunger: number;
  sanity: number;
  health: number;
  note: string;
  warly: boolean;
  character_note: string;
  image_path: string;
  ingredients: IngredientSlot[];
}

export interface Ingredient {
  id: number;
  name: string;
  image_path: string;
}
