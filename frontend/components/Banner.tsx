"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BannerProps {
  warly: boolean | null;
  onWarlyChange: (val: boolean | null) => void;
}

export default function Banner({
  warly,
  onWarlyChange,
}: BannerProps) {
  const [isDark, setIsDark] = useState(true); // default dark; syncs on mount

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function handleThemeToggle() {
    const next = document.documentElement.classList.toggle("dark");
    setIsDark(next);
    try { localStorage.setItem("dst-theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <header className="w-full bg-dst-dark/90 border-b border-dst-gold/30 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Title + logo */}
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/icons/crockpot.png"
            alt="Crock Pot"
            width={36}
            height={36}
            className="shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl lg:text-3xl leading-tight font-dst text-dst-gold truncate">
              Don&apos;t Starve Together
            </h1>
            <p className="hidden sm:block text-sm md:text-base font-dst text-dst-parchment">
              Crock Pot Recipe Browser
            </p>
          </div>
        </div>

        {/* Controls: Warly + theme toggle */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {/* Warly filter */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-dst-parchment">
            <input
              type="checkbox"
              checked={warly === true}
              onChange={(e) => onWarlyChange(e.target.checked ? true : null)}
              className="w-4 h-4 accent-warly-accent cursor-pointer"
              aria-label="Show Warly-only recipes"
            />
            <span className="flex items-center gap-1">
              <span className="text-warly-accent font-semibold font-dst">
                Warly
              </span>{" "}
              only
            </span>
          </label>

          {/* Theme toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg border border-dst-gold/30 bg-dst-brown/60 text-dst-parchment hover:border-dst-gold hover:bg-dst-brown transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              // Sun icon
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            ) : (
              // Moon icon
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
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
