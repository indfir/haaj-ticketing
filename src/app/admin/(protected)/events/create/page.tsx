"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormFieldBuilder, type FormFieldDraft } from "@/components/admin/form-field-builder";
import { CoverImageUpload } from "@/components/admin/cover-image-upload";

const categories = [
  { value: "OBSERVATION", label: "Observation" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "LECTURE", label: "Lecture" },
  { value: "STARGAZING", label: "Stargazing" },
  { value: "MEETUP", label: "Meetup" },
  { value: "OTHER", label: "Other" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formFields, setFormFields] = useState<FormFieldDraft[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      slug: formData.get("slug"),
      title: formData.get("title"),
      subtitle: formData.get("subtitle") || undefined,
      description: formData.get("description") || undefined,
      category: formData.get("category"),
      startAt: new Date(formData.get("startAt") as string).toISOString(),
      endAt: new Date(formData.get("endAt") as string).toISOString(),
      timezone: "Asia/Jakarta",
      locationName: formData.get("locationName") || undefined,
      locationAddress: formData.get("locationAddress") || undefined,
      locationMapUrl: formData.get("locationMapUrl") || undefined,
      isOnline: formData.get("isOnline") === "on",
      onlineUrl: formData.get("onlineUrl") || undefined,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : undefined,
      allowWaitlist: formData.get("allowWaitlist") === "on",
      registrationOpensAt: formData.get("registrationOpensAt")
        ? new Date(formData.get("registrationOpensAt") as string).toISOString()
        : undefined,
      registrationClosesAt: formData.get("registrationClosesAt")
        ? new Date(formData.get("registrationClosesAt") as string).toISOString()
        : undefined,
      requiresApproval: formData.get("requiresApproval") === "on",
      isMembersOnly: formData.get("isMembersOnly") === "on",
      priceIDR: formData.get("priceIDR") ? Number(formData.get("priceIDR")) : 0,
      paymentInfo: (formData.get("paymentInfo") as string)?.trim() || undefined,
      paymentLink: (formData.get("paymentLink") as string)?.trim() || undefined,
      contactPerson: formData.get("contactPerson") || undefined,
      contactPhone: formData.get("contactPhone") || undefined,
      formFields: formFields.map((f, i) => ({
        label: f.label,
        helpText: f.helpText || undefined,
        type: f.type,
        options: f.options || undefined,
        isRequired: f.isRequired,
        sortOrder: i,
      })),
    };

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? "Failed to create event");
        setSaving(false);
        return;
      }

      const data = await res.json();
      router.push(`/admin/events/${data.event.id}`);
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Create Event
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Events are saved as drafts. Publish when ready.
          </p>
        </div>
        <Badge variant="muted">DRAFT</Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Basic info */}
        <section>
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="title" required>Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Meteor Perseid 2026" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" name="subtitle" placeholder="A short tagline" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug" required>Slug</Label>
              <Input id="slug" name="slug" required placeholder="meteor-perseid-2026" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
              <p className="text-xs text-[var(--muted-foreground)]">URL-friendly. Lowercase, hyphens only.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category" required>Category</Label>
              <Select id="category" name="category" required options={categories} />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={5}
                className="h-auto w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]"
                placeholder="Full event description. Markdown supported."
              />
            </div>
            <div className="md:col-span-2">
              <CoverImageUpload
                id="coverImageUrl"
                name="coverImageUrl"
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
              <Input id="startAt" name="startAt" type="datetime-local" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endAt" required>End</Label>
              <Input id="endAt" name="endAt" type="datetime-local" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registrationOpensAt">Registration Opens</Label>
              <Input id="registrationOpensAt" name="registrationOpensAt" type="datetime-local" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="registrationClosesAt">Registration Closes</Label>
              <Input id="registrationClosesAt" name="registrationClosesAt" type="datetime-local" />
            </div>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-3">All times in Asia/Jakarta (WIB).</p>
        </section>

        <Separator />

        {/* Location */}
        <section>
          <h2 className="text-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locationName">Venue Name</Label>
              <Input id="locationName" name="locationName" placeholder="e.g. Bosscha Observatory" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locationAddress">Address</Label>
              <Input id="locationAddress" name="locationAddress" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locationMapUrl">Map URL</Label>
              <Input id="locationMapUrl" name="locationMapUrl" placeholder="https://maps.google.com/..." />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="isOnline" name="isOnline" className="h-4 w-4 rounded border-[var(--border)]" />
              <Label htmlFor="isOnline">This is an online event</Label>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="onlineUrl">Online URL</Label>
              <Input id="onlineUrl" name="onlineUrl" placeholder="https://meet.google.com/..." />
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
              <Input id="capacity" name="capacity" type="number" min="1" placeholder="Leave empty for unlimited" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priceIDR">Price (IDR)</Label>
              <Input id="priceIDR" name="priceIDR" type="number" min="0" defaultValue="0" />
              <p className="text-xs text-[var(--muted-foreground)]">0 = free event</p>
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
                placeholder="https://pay.doku.com/p-link/p/jRWZIPsrap"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Untuk event berbayar, tempel link pembayaran DOKU (contoh: <code className="text-xs bg-[var(--muted)] px-1 py-0.5 rounded">https://pay.doku.com/p-link/p/...</code>). Pembayaran akan dilakukan peserta melalui link ini setelah registrasi berhasil.
              </p>
            </div>

            {/* Manual Payment Info */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="paymentInfo">Informasi Transfer Bank / Manual (Alternatif / Opsional)</Label>
              <textarea
                id="paymentInfo"
                name="paymentInfo"
                rows={3}
                className="h-auto w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]"
                placeholder="Contoh: Transfer Bank BCA 123-456-7890 a.n. Himpunan Astronom Amatir Jakarta"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Instruksi pembayaran manual / transfer bank jika tidak menggunakan DOKU atau sebagai rekening cadangan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="allowWaitlist" name="allowWaitlist" className="h-4 w-4 rounded border-[var(--border)]" />
              <Label htmlFor="allowWaitlist">Allow waitlist</Label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="requiresApproval" name="requiresApproval" className="h-4 w-4 rounded border-[var(--border)]" />
              <Label htmlFor="requiresApproval">Requires approval</Label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isMembersOnly" name="isMembersOnly" className="h-4 w-4 rounded border-[var(--border)]" />
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
              <Input id="contactPerson" name="contactPerson" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" name="contactPhone" />
            </div>
          </div>
        </section>

        <Separator />

        {/* Custom form fields */}
        <section>
          <h2 className="text-xl mb-2" style={{ fontFamily: "var(--font-display)" }}>Custom Registration Fields</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-5">
            Add extra fields to the registration form beyond name, email, and phone.
          </p>
          <FormFieldBuilder fields={formFields} onChange={setFormFields} />
        </section>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {error && <p className="text-sm text-[var(--destructive)]" role="alert">{error}</p>}
          <div className="flex items-center gap-3 ml-auto">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/events")}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save as Draft"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
