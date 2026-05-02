import { fetchRecipes, fetchIngredients } from "@/lib/api";
import RecipeGrid from "@/components/RecipeGrid";
import { Suspense } from "react";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;

  // Build filter params from URL searchParams
  const filterParams: Record<string, string> = {};
  const getString = (val: string | string[] | undefined) =>
    Array.isArray(val) ? val[0] : val;

  const search = getString(params.search);
  const sort = getString(params.sort);
  const warly = getString(params.warly);
  const minHealth = getString(params.min_health);
  const minHunger = getString(params.min_hunger);
  const minSanity = getString(params.min_sanity);
  const ingredientIds = getString(params.ingredient_ids);

  if (search) filterParams.search = search;
  if (sort) filterParams.sort = sort;
  if (warly === "true") filterParams.warly = "true";
  if (minHealth) filterParams.min_health = minHealth;
  if (minHunger) filterParams.min_hunger = minHunger;
  if (minSanity) filterParams.min_sanity = minSanity;
  if (ingredientIds) filterParams.ingredient_ids = ingredientIds;

  const [recipes, ingredients] = await Promise.all([
    fetchRecipes(filterParams),
    fetchIngredients(),
  ]);

  return (
    <Suspense>
      <RecipeGrid initialRecipes={recipes} ingredients={ingredients} />
    </Suspense>
  );
}
