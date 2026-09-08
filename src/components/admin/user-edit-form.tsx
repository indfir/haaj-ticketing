"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
}

interface Props {
  user: User;
}

export function UserEditForm({ user }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name ?? "",
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    newPassword: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Failed to update user");
      }

      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirmText !== "delete") {
      setError("Please type 'delete' to confirm");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Failed to delete user");
      }

      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
      setDeleting(false);
    }
  }

  const roleColors: Record<string, "success" | "warning" | "destructive" | "muted" | "info"> = {
    SUPERADMIN: "destructive",
    ORGANIZER: "success",
    CHECKIN_STAFF: "info",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Edit User
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Update user information and permissions.
          </p>
        </div>
        <Badge variant={roleColors[user.role] ?? "muted"}>
          {user.role}
        </Badge>
      </div>

      <div className="max-w-2xl">
        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)] mb-6">
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
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Leave empty to keep current password"
                minLength={8}
              />
              <p className="text-xs text-[var(--muted-foreground)]">Leave empty to keep current password</p>
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
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-[var(--border)]"
              />
              <Label htmlFor="isActive">Active</Label>
              <p className="text-xs text-[var(--muted-foreground)]">Inactive users cannot log in</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Delete section */}
        <div className="border border-[var(--destructive)]/30 rounded-lg p-6 bg-[var(--card)]">
          <h3 className="text-lg font-medium mb-2 text-[var(--destructive)]" style={{ fontFamily: "var(--font-display)" }}>
            Danger Zone
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Permanently delete this user account. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete User
          </Button>
        </div>

        {/* Delete confirmation dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Delete User
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                This will permanently delete the user account and all associated data.
              </p>
              <div className="mb-4">
                <Label htmlFor="delete-confirm">
                  Type <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-xs">delete</code> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="delete"
                  className="mt-1.5"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeleteConfirmText("");
                    setError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirmText !== "delete"}
                >
                  {deleting ? "Deleting…" : "Delete User"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
