"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatInTimeZone } from "date-fns-tz";

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  event: { title: string } | null;
}

interface Props {
  promoCodes: PromoCode[];
}

export function PromoCodesManager({ promoCodes: initialCodes }: Props) {
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    maxUses: "",
    expiresAt: "",
    eventId: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          discount: parseInt(formData.discount),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
          eventId: formData.eventId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Failed to create promo code");
      }

      const newCode = await res.json();
      setPromoCodes([newCode, ...promoCodes]);
      setFormData({ code: "", discount: "", maxUses: "", expiresAt: "", eventId: "" });
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create promo code");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setPromoCodes(promoCodes.map((p) => p.id === id ? { ...p, isActive: !currentStatus } : p));
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle promo code:", err);
    }
  }

  async function deleteCode(id: string) {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPromoCodes(promoCodes.filter((p) => p.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to delete promo code:", err);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Promo Codes
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Manage discount codes for events.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Code"}
        </Button>
      </div>

      {showForm && (
        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)] mb-6">
          <h2 className="text-lg mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Create Promo Code
          </h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5">
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="SUMMER2026"
                  required
                  className="uppercase"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="discount">Discount % *</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="20"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maxUses">Max Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="100"
                />
                <p className="text-xs text-[var(--muted-foreground)]">Leave empty for unlimited</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expiresAt">Expires At</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
                <p className="text-xs text-[var(--muted-foreground)]">Leave empty for no expiry</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create Code"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {promoCodes.length === 0 ? (
        <div className="border border-[var(--border)] rounded-lg p-12 bg-[var(--card)] text-center">
          <p className="text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
            No promo codes yet
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Create your first promo code to offer discounts on events.
          </p>
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Code</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Event</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Discount</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Used</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Expires</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Status</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {promoCodes.map((promo) => {
                const isExpired = promo.expiresAt ? new Date(promo.expiresAt) < new Date() : false;
                const isMaxed = promo.maxUses ? promo.usedCount >= promo.maxUses : false;
                const isActive = promo.isActive && !isExpired && !isMaxed;

                return (
                  <tr key={promo.id}>
                    <td className="px-5 py-3">
                      <code className="font-mono text-sm bg-[var(--muted)] px-2 py-1 rounded">
                        {promo.code}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">
                      {promo.event?.title ?? "All events"}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {promo.discount}%
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {promo.usedCount}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                    </td>
                    <td className="px-5 py-3 text-[var(--muted-foreground)]">
                      {promo.expiresAt
                        ? formatInTimeZone(new Date(promo.expiresAt), "Asia/Jakarta", "d MMM yyyy")
                        : "Never"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={isActive ? "success" : "muted"}>
                        {isActive ? "Active" : isExpired ? "Expired" : isMaxed ? "Maxed" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(promo.id, promo.isActive)}
                        >
                          {promo.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCode(promo.id)}
                          className="text-[var(--destructive)] hover:text-[var(--destructive)]"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
