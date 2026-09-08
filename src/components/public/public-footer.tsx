"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>HAAJ</p>
            <p className="text-sm text-[var(--muted-foreground)] max-w-xs leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Events */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3 font-medium">{t("footer.events")}</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/events" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.allEvents")}</Link>
              <Link href="/events?category=OBSERVATION" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.observations")}</Link>
              <Link href="/events?category=STARGAZING" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.stargazing")}</Link>
              <Link href="/events?category=WORKSHOP" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.workshops")}</Link>
            </div>
          </div>

          {/* Community */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3 font-medium">{t("footer.community")}</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/about" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.aboutHaaj")}</Link>
              <Link href="/code-of-conduct" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.codeOfConduct")}</Link>
              <Link href="/contact" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.contact")}</Link>
              <Link href="/ticket/lookup" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.findMyTicket")}</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3 font-medium">{t("footer.legal")}</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">{t("footer.privacyPolicy")}</Link>
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-2 font-medium">{t("footer.contact")}</p>
              <p className="text-sm text-[var(--muted-foreground)]">humas.haaj84@gmail.com</p>
              <p className="text-sm text-[var(--muted-foreground)]">Planetarium Jakarta</p>
              <p className="text-sm text-[var(--muted-foreground)]">Jl. Cikini Raya No. 73</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-5 sm:pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-[var(--muted-foreground)]">
            &copy; {new Date().getFullYear()} HAAJ — Himpunan Astronomi Amatir Jakarta
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Built for the community that looks up.
          </p>
        </div>
      </div>
    </footer>
  );
}
