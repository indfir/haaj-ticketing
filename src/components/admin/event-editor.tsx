"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormFieldBuilder, type FormFieldDraft } from "@/components/admin/form-field-builder";
import { CoverImageUpload } from "@/components/admin/cover-image-upload";
import { format } from "date-fns";
import type { Event, EventFormField } from "@/generated/prisma/client";

const categories = [
  { value: "OBSERVATION", label: "Observation" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "LECTURE", label: "Lecture" },
  { value: "STARGAZING", label: "Stargazing" },
  { value: "MEETUP", label: "Meetup" },
  { value: "OTHER", label: "Other" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "muted" | "default" | "info"> = {
  DRAFT: "muted",
  PUBLISHED: "success",
  CLOSED: "default",
  CANCELLED: "destructive",
  ARCHIVED: "muted",
};

interface Props {
  event: Event & {
    formFields: EventFormField[];
    _count: { registrations: number };
  };
}

function toLocalInputValue(date: Date): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function EventEditor({ event }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [shouldPublish, setShouldPublish] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [formFields, setFormFields] = useState<FormFieldDraft[]>(
    event.formFields.map((f) => ({
      id: f.id,
      label: f.label,
      helpText: f.helpText ?? undefined,
      type: f.type as FormFieldDraft["type"],
      options: typeof f.options === "string" ? f.options : undefined,
      isRequired: f.isRequired,
      sortOrder: f.sortOrder,
    }))
  );

  async function handleDelete() {
    if (deleteConfirmText !== "delete") {
      setError("Please type 'delete' to confirm");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Failed to delete event");
      }

      router.push("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setPublishing(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      slug: formData.get("slug"),
      title: formData.get("title"),
      subtitle: formData.get("subtitle") || null,
      description: formData.get("description") || null,
      category: formData.get("category"),
      startAt: new Date(formData.get("startAt") as string).toISOString(),
      endAt: new Date(formData.get("endAt") as string).toISOString(),
      timezone: "Asia/Jakarta",
      locationName: formData.get("locationName") || null,
      locationAddress: formData.get("locationAddress") || null,
      locationMapUrl: formData.get("locationMapUrl") || null,
      isOnline: formData.get("isOnline") === "on",
      onlineUrl: formData.get("onlineUrl") || null,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      allowWaitlist: formData.get("allowWaitlist") === "on",
      registrationOpensAt: formData.get("registrationOpensAt")
        ? new Date(formData.get("registrationOpensAt") as string).toISOString()
        : null,
      registrationClosesAt: formData.get("registrationClosesAt")
        ? new Date(formData.get("registrationClosesAt") as string).toISOString()
        : null,
      requiresApproval: formData.get("requiresApproval") === "on",
      isMembersOnly: formData.get("isMembersOnly") === "on",
      priceIDR: formData.get("priceIDR") ? Number(formData.get("priceIDR")) : 0,
      paymentInfo: (formData.get("paymentInfo") as string)?.trim() || null,
      paymentLink: (formData.get("paymentLink") as string)?.trim() || null,
      contactPerson: formData.get("contactPerson") || null,
      contactPhone: formData.get("contactPhone") || null,
      formFields: formFields.map((f, i) => ({
        ...(f.id ? { id: f.id } : {}),
        label: f.label,
        helpText: f.helpText || undefined,
        type: f.type,
        options: f.options || undefined,
        isRequired: f.isRequired,
        sortOrder: i,
      })),
    };

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? "Failed to save event");
        setSaving(false);
        return;
      }

      if (shouldPublish && event.status === "DRAFT") {
        const pubRes = await fetch(`/api/admin/events/${event.id}/publish`, { method: "POST" });
        if (!pubRes.ok) {
          const data = await pubRes.json();
          setError(data.error?.message ?? "Failed to publish");
          setPublishing(false);
          setSaving(false);
          setShouldPublish(false);
          return;
        }
      }

      router.refresh();
      setSaving(false);
      setPublishing(false);
      setShouldPublish(false);
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
      setPublishing(false);
      setShouldPublish(false);
    }
  }

  return (
    <div className="w-full max-w-[900px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-2xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Edit Event
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {event._count.registrations} registration{event._count.registrations !== 1 ? "s" : ""}
          </p>
        </div>
        <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Basic info */}
        <section>
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="title" required>Title</Label>
              <Input id="title" name="title" required defaultValue={event.title} />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" name="subtitle" defaultValue={event.subtitle ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug" required>Slug</Label>
              <Input id="slug" name="slug" required defaultValue={event.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category" required>Category</Label>
              <Select id="category" name="category" required defaultValue={event.category} options={categories} />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="h-auto w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]"
                defaultValue={event.description ?? ""}
              />
            </div>
            <div className="md:col-span-2">
              <CoverImageUpload
                id="coverImageUrl"
                name="coverImageUrl"
                defaultValue={event.coverImageUrl ?? ""}
                uploadFolder="covers"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Date & Time */}
        <section>
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>Date & Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startAt" required>Start</Label>
              <Input id="startAt" name="startAt" type="datetime-local" required defaultValue={toLocalInputValue(event.startAt)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endAt" required>End</Label>
              <Input id="endAt" name="endAt" type="datetime-local" required defaultValue={toLocalInputValue(event.endAt)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registrationOpensAt">Registration Opens</Label>
              <Input id="registrationOpensAt" name="registrationOpensAt" type="datetime-local"
                defaultValue={event.registrationOpensAt ? toLocalInputValue(event.registrationOpensAt) : ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registrationClosesAt">Registration Closes</Label>
              <Input id="registrationClosesAt" name="registrationClosesAt" type="datetime-local"
                defaultValue={event.registrationClosesAt ? toLocalInputValue(event.registrationClosesAt) : ""} />
            </div>
          </div>
        </section>

        <Separator />

        {/* Location */}
        <section>
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locationName">Venue Name</Label>
              <Input id="locationName" name="locationName" defaultValue={event.locationName ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locationAddress">Address</Label>
              <Input id="locationAddress" name="locationAddress" defaultValue={event.locationAddress ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locationMapUrl">Map URL</Label>
              <Input id="locationMapUrl" name="locationMapUrl" defaultValue={event.locationMapUrl ?? ""} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="isOnline" name="isOnline" defaultChecked={event.isOnline} className="h-4 w-4 rounded border-[var(--border)]" />
              <Label htmlFor="isOnline">Online event</Label>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="onlineUrl">Online URL</Label>
              <Input id="onlineUrl" name="onlineUrl" defaultValue={event.onlineUrl ?? ""} />
            </div>
          </div>
        </section>

        <Separator />

        {/* Capacity & Registration */}
        <section>
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>Capacity & Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min="1" defaultValue={event.capacity ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priceIDR">Price (IDR)</Label>
              <Input id="priceIDR" name="priceIDR" type="number" min="0" defaultValue={event.priceIDR} />
            </div>

            {/* DOKU Payment Gateway Link */}
            <div className="md:col-span-2 flex flex-col gap-1.5 p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40">
              <div className="flex items-center gap-2">
                <Label htmlFor="paymentLink" className="font-semibold text-sm">
                  DOKU Payment Link / Gateway URL
                </Label>
                <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider">
                  DOKU Gateway
                </Badge>
              </div>
              <Input
                id="paymentLink"
                name="paymentLink"
                type="url"
                defaultValue={event.paymentLink ?? ""}
                placeholder="https://pay.doku.com/p-link/p/jRWZIPsrap"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Untuk event berbayar, tempel link pembayaran DOKU (contoh: <code className="text-xs bg-[var(--muted)] px-1 py-0.5 rounded">https://pay.doku.com/p-link/p/...</code>). Pembayaran akan dilakukan peserta melalui link ini setelah registrasi berhasil.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="paymentInfo">Informasi Transfer Bank / Manual (Alternatif)</Label>
              <textarea
                id="paymentInfo"
                name="paymentInfo"
                rows={3}
                defaultValue={event.paymentInfo ?? ""}
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]"
                placeholder="Bank account details for payment transfer (shown to participants for paid events)"
              />
              <p className="text-xs text-[var(--muted-foreground)]">Leave empty for free events. This will be shown to participants when they register for paid events.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="allowWaitlist" name="allowWaitlist" defaultChecked={event.allowWaitlist} className="h-4 w-4 rounded border-[var(--border)]" />
              <Label htmlFor="allowWaitlist">Allow waitlist</Label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="requiresApproval" name="requiresApproval" defaultChecked={event.requiresApproval} className="h-4 w-4 rounded border-[var(--border)]" />
              <Label htmlFor="requiresApproval">Requires approval</Label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isMembersOnly" name="isMembersOnly" defaultChecked={event.isMembersOnly} className="h-4 w-4 rounded border-[var(--border)]" />
              <Label htmlFor="isMembersOnly">Members only</Label>
            </div>
          </div>
        </section>

        <Separator />

        {/* Contact */}
        <section>
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" name="contactPerson" defaultValue={event.contactPerson ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" name="contactPhone" defaultValue={event.contactPhone ?? ""} />
            </div>
          </div>
        </section>

        <Separator />

        {/* Custom form fields */}
        <section>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>Custom Registration Fields</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-5">
            Drag to reorder. Changes are saved with the event.
          </p>
          <FormFieldBuilder fields={formFields} onChange={setFormFields} />
        </section>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {error && <p className="text-sm text-[var(--destructive)]" role="alert">{error}</p>}
          <div className="flex items-center gap-3 ml-auto">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/events")}>
              Back
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(true)} className="text-[var(--destructive)] border-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white">
              Delete Event
            </Button>
            <Button type="submit" variant="outline" disabled={saving || publishing} onClick={() => setShouldPublish(false)}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            {event.status === "DRAFT" && (
              <Button type="submit" disabled={saving || publishing} onClick={() => setShouldPublish(true)}>
                {publishing ? "Publishing…" : "Save & Publish"}
              </Button>
            )}
          </div>
        </div>

        {/* Delete confirmation dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Delete Event
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                This action cannot be undone. This will permanently delete the event and all associated registrations.
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
                  {deleting ? "Deleting…" : "Delete Event"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
