"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Recipe } from "@/lib/types";
import RecipeDetail from "./RecipeDetail";

interface RecipeModalProps {
  recipe: Recipe | null;
  isFavorite: boolean;
  onFavoriteToggle: (id: number) => void;
  onClose: () => void;
}

export default function RecipeModal({
  recipe,
  isFavorite,
  onFavoriteToggle,
  onClose,
}: RecipeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Open/close dialog when recipe changes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (recipe) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [recipe]);

  // Handle native dialog close event (Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => handleClose();
    dialog.addEventListener("close", handleNativeClose);
    return () => dialog.removeEventListener("close", handleNativeClose);
  }, [handleClose]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) handleClose();
  }

  async function handleShare() {
    if (!recipe) return;
    const url = `${window.location.origin}/recipes/${recipe.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={handleClose}
      className="w-full max-w-full md:max-w-lg rounded-t-xl md:rounded-xl p-0 bg-dst-dark border border-dst-gold/40 shadow-2xl text-dst-parchment flex flex-col overflow-hidden"
      aria-modal="true"
      aria-label={recipe ? `${recipe.dish} recipe details` : "Recipe details"}
    >
      {recipe && (
        <>
          {/* Top bar: just close button */}
          <div className="flex justify-end p-3 border-b border-dst-gold/20">
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-dst-parchment/60 hover:text-dst-parchment hover:bg-dst-brown transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable body: RecipeDetail handles everything */}
          <div className="p-5 overflow-y-auto max-h-[65vh]">
            <RecipeDetail recipe={recipe} size="md" />
          </div>

          {/* Footer: favorite + share */}
          <div className="flex items-center gap-3 p-5 border-t border-dst-gold/20">
            {/* Favorite button */}
            <button
              onClick={() => onFavoriteToggle(recipe.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isFavorite
                  ? "bg-dst-gold/20 border-dst-gold/60 text-dst-gold"
                  : "border-dst-gold/30 text-dst-parchment/70 hover:border-dst-gold/60 hover:text-dst-gold"
              }`}
              aria-pressed={isFavorite}
            >
              {isFavorite ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
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
              {isFavorite ? "Favorited" : "Favorite"}
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dst-gold/30 text-dst-parchment/70 hover:border-dst-gold/60 hover:text-dst-gold text-sm font-medium transition-colors"
              aria-label={copied ? "Copied!" : "Copy recipe link to clipboard"}
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
