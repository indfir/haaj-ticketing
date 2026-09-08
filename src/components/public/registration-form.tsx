"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FormField {
  id: string;
  label: string;
  helpText: string | null;
  type: string;
  options: unknown;
  isRequired: boolean;
}

interface Props {
  eventId: string;
  slug: string;
  formFields: FormField[];
  allowWaitlist: boolean;
  isFull: boolean;
  requiresApproval: boolean;
  priceIDR?: number;
  paymentInfo?: string | null;
  paymentLink?: string | null;
}

function parseOptions(options: unknown): { value: string; label: string }[] {
  if (!options) return [];
  if (typeof options === "string") {
    return options.split(",").map((v) => ({ value: v.trim(), label: v.trim() }));
  }
  if (typeof options === "object" && options !== null) {
    const obj = options as Record<string, unknown>;
    if (Array.isArray(obj.values)) {
      return (obj.values as string[]).map((v) => ({ value: v, label: v }));
    }
  }
  return [];
}

export function RegistrationForm({
  eventId,
  slug,
  formFields,
  allowWaitlist,
  isFull,
  requiresApproval,
  priceIDR = 0,
  paymentInfo,
  paymentLink,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isPaid = priceIDR > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const body: Record<string, unknown> = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      instagram: formData.get("instagram") || undefined,
      isHaajMember: formData.get("isHaajMember") === "on",
      memberNumber: formData.get("memberNumber") || undefined,
      answers: {},
      paymentMethod: paymentLink ? "DOKU_PAYMENT_LINK" : "MANUAL_TRANSFER",
    };

    const answers: Record<string, string> = {};
    for (const field of formFields) {
      const val = formData.get(`field_${field.id}`);
      if (val) answers[field.id] = val as string;
    }
    body.answers = answers;

    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      router.push(`/t/${data.registration.ticketCode}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Standard fields */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName" required>Full Name</Label>
          <Input id="fullName" name="fullName" required autoComplete="name" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" required>Email Address</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
          <p className="text-xs text-[var(--muted-foreground)]">Ticket and updates will be sent here.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone" required>WhatsApp / Phone Number</Label>
          <Input id="phone" name="phone" type="tel" required placeholder="08xxxxxxxxxx" autoComplete="tel" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instagram">Instagram Username (Optional)</Label>
          <Input id="instagram" name="instagram" placeholder="@username" />
        </div>

        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isHaajMember"
              name="isHaajMember"
              className="h-4 w-4 rounded border-[var(--input)] text-[var(--accent)] focus:ring-[var(--ring)]"
            />
            <Label htmlFor="isHaajMember" className="cursor-pointer font-normal">
              I am a registered HAAJ Member
            </Label>
          </div>
          <Input
            id="memberNumber"
            name="memberNumber"
            placeholder="Membership Number (if applicable)"
            className="text-xs"
          />
        </div>
      </div>

      {/* Dynamic fields */}
      {formFields.map((field) => (
        <div key={field.id} className="flex flex-col gap-1.5">
          <Label htmlFor={`field_${field.id}`} required={field.isRequired}>
            {field.label}
          </Label>
          {field.type === "SELECT" ? (
            <Select
              id={`field_${field.id}`}
              name={`field_${field.id}`}
              required={field.isRequired}
              options={parseOptions(field.options)}
            />
          ) : field.type === "TEXTAREA" ? (
            <textarea
              id={`field_${field.id}`}
              name={`field_${field.id}`}
              required={field.isRequired}
              rows={3}
              className="h-auto w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]"
            />
          ) : (
            <Input
              id={`field_${field.id}`}
              name={`field_${field.id}`}
              type={field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : field.type === "NUMBER" ? "number" : field.type === "DATE" ? "date" : "text"}
              required={field.isRequired}
            />
          )}
          {field.helpText && (
            <p className="text-xs text-[var(--muted-foreground)]">{field.helpText}</p>
          )}
        </div>
      ))}

      {/* Pricing Information for paid events */}
      {isPaid && (
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--foreground)]">Biaya Pendaftaran</span>
            <span className="text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-display)" }}>
              IDR {priceIDR.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="text-xs text-[var(--muted-foreground)] leading-relaxed bg-[var(--muted)]/50 p-2.5 rounded-lg border border-[var(--border)]">
            <p className="font-medium text-[var(--foreground)] mb-0.5">ℹ️ Pembayaran Dilakukan Setelah Pendaftaran</p>
            <p>
              Setelah mengisi data di atas dan menekan tombol daftar, Anda akan diarahkan ke halaman tiket untuk melakukan pembayaran via <strong>{paymentLink ? "DOKU Payment Gateway" : "Transfer Bank"}</strong>.
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-[var(--destructive)]" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full"
        size="lg"
      >
        {submitting
          ? "Memproses Pendaftaran…"
          : isPaid
          ? "Daftar & Lanjut ke Pembayaran →"
          : isFull
          ? "Join Waitlist"
          : "Daftar Event"}
      </Button>

      {requiresApproval && (
        <p className="text-xs text-center text-[var(--muted-foreground)]">
          Registrations for this event require organizer approval before confirmation.
        </p>
      )}
    </form>
  );
}
