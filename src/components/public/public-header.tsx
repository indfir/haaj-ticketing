"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSelector } from "@/components/public/language-selector";
import { useLanguage } from "@/lib/language-context";

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const links = [
    { href: "/events", label: t("nav.events") },
    { href: "/guide", label: t("nav.guide") },
    { href: "/about", label: t("nav.about") },
    { href: "/ticket/lookup", label: t("nav.findTicket") },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <span className="text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              HAAJ
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.15em] text-[var(--muted-foreground)] border-l border-[var(--border)] pl-2.5 leading-tight">
              Event<br />Ticketing
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors duration-150 ${
                  isActive(link.href)
                    ? "text-[var(--accent)] bg-[var(--accent-muted)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-2 pl-2 border-l border-[var(--border)] flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <line x1="5" y1="5" x2="15" y2="15" />
                    <line x1="15" y1="5" x2="5" y2="15" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="5" x2="17" y2="5" />
                    <line x1="3" y1="10" x2="17" y2="10" />
                    <line x1="3" y1="15" x2="17" y2="15" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 top-[57px] mobile-menu-overlay md:hidden z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed top-[57px] right-0 bottom-0 w-64 bg-[var(--background)] border-l border-[var(--border)] z-50 md:hidden"
            style={{ animation: "slide-in-right 0.2s ease-out" }}
          >
            <div className="flex flex-col p-4 gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-md text-sm transition-colors ${
                    isActive(link.href)
                      ? "text-[var(--accent)] bg-[var(--accent-muted)]"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="px-4 pt-4 mt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">
                Himpunan Astronomi Amatir Jakarta
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Est. 1984
              </p>
            </div>
            <div className="px-4 pt-4 border-t border-[var(--border)]">
              <LanguageSelector />
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
