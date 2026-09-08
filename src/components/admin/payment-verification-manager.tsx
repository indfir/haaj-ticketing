"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from "date-fns-tz";

interface Registration {
  id: string;
  ticketCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  paymentProof: string | null;
  paymentRef?: string | null;
  paymentMethod?: string | null;
  createdAt: Date;
  event: {
    title: string;
    slug: string;
    priceIDR: number;
    paymentInfo: string | null;
    paymentLink?: string | null;
  };
}

interface Props {
  registrations: Registration[];
}

export function PaymentVerificationManager({ registrations }: Props) {
  const router = useRouter();
  const [selectedProof, setSelectedProof] = useState<Registration | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleConfirm(id: string) {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error?.message ?? "Failed to confirm payment");
        return;
      }

      router.refresh();
    } catch (err) {
      alert("Failed to confirm payment");
    } finally {
      setProcessing(null);
      setSelectedProof(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Are you sure you want to reject this payment? The participant will need to re-upload proof.")) {
      return;
    }

    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error?.message ?? "Failed to reject payment");
        return;
      }

      router.refresh();
    } catch (err) {
      alert("Failed to reject payment");
    } finally {
      setProcessing(null);
      setSelectedProof(null);
    }
  }

  if (registrations.length === 0) {
    return (
      <div className="border border-[var(--border)] rounded-lg p-12 bg-[var(--card)] text-center">
        <p className="text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
          No pending payments
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">
          All payments have been verified.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          {registrations.length} pending payment{registrations.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4">
        {registrations.map((reg) => (
          <div key={reg.id} className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium" style={{ fontFamily: "var(--font-display)" }}>
                    {reg.fullName}
                  </h3>
                  {reg.event.paymentLink || reg.paymentMethod === "DOKU_PAYMENT_LINK" ? (
                    <Badge variant="info" className="text-[10px] font-bold tracking-wide">
                      DOKU Payment
                    </Badge>
                  ) : (
                    <Badge variant="muted" className="text-[10px]">
                      Manual Transfer
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">{reg.email} • {reg.phone ?? "No phone"}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">{reg.event.title}</span>
                  <span>•</span>
                  <span>Ticket: <code className="font-mono font-semibold">{reg.ticketCode}</code></span>
                  <span>•</span>
                  <span>IDR {reg.event.priceIDR.toLocaleString("id-ID")}</span>
                  <span>•</span>
                  <span>{formatInTimeZone(new Date(reg.createdAt), "Asia/Jakarta", "d MMM yyyy, HH:mm")} WIB</span>
                </div>
              </div>
              <Badge variant="warning">PENDING PAYMENT</Badge>
            </div>

            {/* DOKU Reference or Payment Method Info */}
            {reg.paymentRef ? (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="text-[var(--muted-foreground)]">No. Invoice / Ref Transaksi DOKU: </span>
                  <span className="font-mono font-bold text-sm text-[var(--foreground)]">{reg.paymentRef}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(reg.paymentRef!);
                    alert("Nomor referensi DOKU disalin!");
                  }}
                  className="text-xs text-[var(--accent)] hover:underline self-start sm:self-auto font-medium"
                >
                  Salin No. Referensi
                </button>
              </div>
            ) : null}

            {reg.paymentProof ? (
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Bukti Bayar / Screenshot</p>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--muted)] max-w-md">
                  {reg.paymentProof.endsWith(".pdf") ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-[var(--muted-foreground)]">PDF Document</p>
                      <a
                        href={reg.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--accent)] hover:underline mt-2 inline-block"
                      >
                        View PDF
                      </a>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={reg.paymentProof}
                      alt="Payment proof"
                      className="w-full h-auto cursor-pointer max-h-72 object-contain bg-black/20"
                      onClick={() => setSelectedProof(reg)}
                    />
                  )}
                </div>
              </div>
            ) : !reg.paymentRef ? (
              <div className="p-3 border border-[var(--warning)]/30 bg-[var(--warning)]/5 rounded-lg">
                <p className="text-xs text-[var(--warning)]">Belum ada bukti bayar atau nomor referensi DOKU yang diunggah.</p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {reg.paymentProof && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProof(reg)}
                >
                  Lihat Bukti Full
                </Button>
              )}
              {reg.event.paymentLink && (
                <a
                  href={reg.event.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] text-xs hover:bg-[var(--muted)] transition-colors"
                >
                  <span>Buka Link DOKU Event ↗</span>
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirm(reg.id)}
                disabled={processing === reg.id}
                className="text-[var(--success)] border-[var(--success)] hover:bg-[var(--success)] hover:text-white ml-auto"
              >
                {processing === reg.id ? "Processing…" : "Confirm Payment"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(reg.id)}
                disabled={processing === reg.id}
                className="text-[var(--destructive)] border-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Image preview modal */}
      {selectedProof && selectedProof.paymentProof && !selectedProof.paymentProof.endsWith(".pdf") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedProof(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedProof.paymentProof}
              alt="Payment proof"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
