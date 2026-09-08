"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function UserCreateForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ORGANIZER",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Failed to create user");
      }

      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Invite User
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Create a new admin user account.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5">
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@haaj.id"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
              <p className="text-xs text-[var(--muted-foreground)]">Minimum 8 characters</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role *</Label>
              <Select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: "CHECKIN_STAFF", label: "Check-in Staff" },
                  { value: "ORGANIZER", label: "Organizer" },
                  { value: "SUPERADMIN", label: "Super Admin" },
                ]}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                <strong>Check-in Staff:</strong> Can only scan tickets<br />
                <strong>Organizer:</strong> Can create and manage events<br />
                <strong>Super Admin:</strong> Full access including user management
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create User"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
