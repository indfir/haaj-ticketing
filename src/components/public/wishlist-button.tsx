"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Props {
  eventId: string;
  className?: string;
}

export function WishlistButton({ eventId, className }: Props) {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.wishlist) {
          setIsWishlisted(data.wishlist.some((w: any) => w.eventId === eventId));
        }
      })
      .catch(() => {});
  }, [eventId, session]);

  async function toggleWishlist() {
    if (!session?.user) {
      window.location.href = "/admin/login";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      setIsWishlisted(data.added);
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)]",
        "transition-colors duration-150",
        isWishlisted
          ? "text-[var(--destructive)] border-[var(--destructive)] bg-[var(--destructive)]/10"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]",
        className
      )}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isWishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
