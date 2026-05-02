import { fetchRecipe, fetchAllRecipeSlugs } from "@/lib/api";
import Link from "next/link";
import RecipeDetail from "@/components/RecipeDetail";
import { notFound } from "next/navigation";

// Allow dynamic params not prebuilt at build time (e.g. if API was unavailable)
export const dynamicParams = true;

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await fetchAllRecipeSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;

  let recipe;
  try {
    recipe = await fetchRecipe(slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Back nav */}
      <header className="sticky top-0 z-40 bg-dst-dark/90 border-b border-dst-gold/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-dst-gold hover:text-dst-parchment transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Recipe Browser
          </Link>
          <span className="text-dst-parchment/30">/</span>
          <span className="text-sm text-dst-parchment/70 truncate">{recipe.dish}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <RecipeDetail recipe={recipe} size="lg" />

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-dst-gold border border-dst-gold/30 rounded-lg px-4 py-2 hover:bg-dst-gold/10 transition-colors text-sm mt-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to all recipes
        </Link>
      </main>
    </div>
  );
}
