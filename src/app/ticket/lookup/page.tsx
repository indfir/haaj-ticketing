"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";

export default function TicketLookupPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tickets/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Find My Ticket
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-8">
            Enter your email and we will send you a link to your ticket.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" required>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--destructive)]" role="alert">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending…" : "Send Ticket Link"}
              </Button>
            </form>
          ) : (
            <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
              <p className="text-sm">
                If an account exists for <strong>{email}</strong>, a ticket link has been sent.
                Please check your inbox (and spam folder).
              </p>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
