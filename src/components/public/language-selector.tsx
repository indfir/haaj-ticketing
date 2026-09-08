"use client";

import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] p-0.5">
      <button
        onClick={() => setLanguage("id")}
        className={cn(
          "rounded px-2.5 py-1 text-xs font-medium transition-colors",
          language === "id"
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        )}
        aria-label="Bahasa Indonesia"
      >
        ID
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded px-2.5 py-1 text-xs font-medium transition-colors",
          language === "en"
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
        )}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
