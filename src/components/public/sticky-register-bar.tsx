"use client";

interface Props {
  eventTitle: string;
  priceIDR: number;
}

export function StickyRegisterBar({ eventTitle, priceIDR }: Props) {
  function scrollToForm() {
    const el = document.getElementById("register");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{eventTitle}</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {priceIDR === 0 ? "Free" : `IDR ${priceIDR.toLocaleString("id-ID")}`}
          </p>
        </div>
        <button
          onClick={scrollToForm}
          className="flex-shrink-0 h-10 px-5 rounded-md bg-[var(--accent)] text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
        >
          Register
        </button>
      </div>
    </div>
  );
}
