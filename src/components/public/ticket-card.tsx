"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInTimeZone } from "date-fns-tz";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "muted" | "info"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  PENDING_PAYMENT: "warning",
  WAITLISTED: "muted",
  REJECTED: "destructive",
  CANCELLED: "destructive",
};

interface TicketEvent {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date | null;
  locationName: string | null;
  isOnline: boolean;
  priceIDR?: number;
  paymentLink?: string | null;
  paymentInfo?: string | null;
}

interface CheckIn {
  id: string;
  checkedInAt: Date;
}

interface TicketData {
  ticketCode: string;
  status: string;
  fullName: string;
  email: string;
  event: TicketEvent;
  checkIn: CheckIn | null;
  qrImage: string;
  paymentRef?: string | null;
}

function buildTicketHtml(data: TicketData): string {
  const dateStr = formatInTimeZone(data.event.startAt, "Asia/Jakarta", "d MMM yyyy");
  const timeStr = formatInTimeZone(data.event.startAt, "Asia/Jakarta", "HH:mm");
  const venue = data.event.isOnline ? "Online" : data.event.locationName ?? "[LOCATION]";

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    CONFIRMED: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
    PENDING: { bg: "#fef9c3", text: "#854d0e", border: "#fde68a" },
    PENDING_PAYMENT: { bg: "#fef9c3", text: "#854d0e", border: "#fde68a" },
    WAITLISTED: { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" },
    REJECTED: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
    CANCELLED: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  };
  const sc = statusColors[data.status] ?? statusColors.WAITLISTED;

  return `
    <div style="width:480px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#1a1a1a;border-radius:8px;overflow:hidden;border:1px solid #333;">
      <div style="padding:20px 24px;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:18px;font-weight:500;color:#fff;">HAAJ</span>
        <span style="background:${sc.bg};color:${sc.text};border:1px solid ${sc.border};padding:4px 12px;border-radius:6px;font-size:12px;font-weight:500;letter-spacing:0.5px;">${data.status}</span>
      </div>
      <div style="padding:32px 24px;background:#fff;display:flex;flex-direction:column;align-items:center;">
        <img src="${data.qrImage}" style="width:240px;height:240px;margin-bottom:16px;" />
        <p style="font-size:24px;font-family:'SF Mono',Monaco,monospace;letter-spacing:2px;color:#000;margin:0;">${data.ticketCode}</p>
      </div>
      <div style="padding:20px 24px;">
        <div style="margin-bottom:16px;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 6px 0;">Event</p>
          <p style="font-size:18px;font-weight:500;color:#fff;margin:0;">${data.event.title}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div>
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 6px 0;">Date</p>
            <p style="font-size:14px;color:#fff;margin:0;">${dateStr}</p>
            <p style="font-size:12px;color:#888;margin:4px 0 0 0;">${timeStr} WIB</p>
          </div>
          <div>
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 6px 0;">Venue</p>
            <p style="font-size:14px;color:#fff;margin:0;">${venue}</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div>
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 6px 0;">Name</p>
            <p style="font-size:14px;color:#fff;margin:0;">${data.fullName}</p>
          </div>
          <div>
            <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#888;margin:0 0 6px 0;">Email</p>
            <p style="font-size:14px;color:#fff;margin:0;">${data.email}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function TicketCard({ ticketCode, status, fullName, email, event, checkIn, qrImage, paymentRef }: TicketData) {
  const [downloading, setDownloading] = useState(false);
  const [currentRef, setCurrentRef] = useState(paymentRef ?? "");
  const [refInput, setRefInput] = useState(paymentRef ?? "");
  const [savingRef, setSavingRef] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  async function handleSaveRef(e: React.FormEvent) {
    e.preventDefault();
    if (!refInput.trim()) return;
    setSavingRef(true);
    setSavedMsg("");
    try {
      const res = await fetch(`/api/tickets/${ticketCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentRef: refInput.trim() }),
      });
      if (res.ok) {
        setCurrentRef(refInput.trim());
        setSavedMsg("Nomor referensi pembayaran berhasil disimpan!");
      } else {
        alert("Gagal menyimpan nomor referensi. Silakan coba lagi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingRef(false);
    }
  }

  async function handleDownload(format: "pdf" | "png") {
    setDownloading(true);
    try {
      const html = buildTicketHtml({ ticketCode, status, fullName, email, event, checkIn, qrImage, paymentRef: currentRef });

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.zIndex = "-1";
      container.innerHTML = html;
      document.body.appendChild(container);

      await new Promise((r) => setTimeout(r, 200));

      const imgEl = container.querySelector("img");
      if (imgEl) {
        await new Promise<void>((resolve) => {
          if (imgEl.complete) { resolve(); return; }
          imgEl.onload = () => resolve();
          imgEl.onerror = () => resolve();
        });
      }

      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(container, {
        backgroundColor: "#1a1a1a",
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");

      if (format === "png") {
        const link = document.createElement("a");
        link.download = `ticket-${ticketCode}.png`;
        link.href = imgData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;
        pdf.addImage(imgData, "PNG", 20, y, imgWidth, imgHeight);
        pdf.save(`ticket-${ticketCode}.pdf`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Download failed: ${msg}`);
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-lg" style={{ fontFamily: "var(--font-display)" }}>HAAJ</span>
            <Badge variant={statusVariant[status]}>
              {status}
            </Badge>
          </div>
        </div>

        {/* Pending Payment Alert & DOKU Action */}
        {status === "PENDING_PAYMENT" && (
          <div className="px-6 py-5 bg-amber-500/10 border-b border-amber-500/20 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-semibold">Pendaftaran Berhasil — Menunggu Pembayaran</span>
            </div>

            {event.priceIDR ? (
              <div className="p-3 bg-[var(--card)] rounded-lg border border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">Total Tagihan Event:</span>
                <span className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-display)" }}>
                  IDR {event.priceIDR.toLocaleString("id-ID")}
                </span>
              </div>
            ) : null}

            {event.paymentLink && (
              <div className="pt-1 space-y-2">
                <a
                  href={event.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 rounded-lg bg-[#ED1C24] hover:bg-[#d0171e] text-white font-bold text-sm transition-all shadow hover:shadow-md active:scale-[0.99]"
                >
                  <span>Bayar Sekarang via DOKU</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Klik tombol di atas untuk membayar secara online melalui DOKU Payment Gateway (Virtual Account Bank, Kartu Kredit, e-Wallet).
                </p>
              </div>
            )}

            {event.paymentInfo && (
              <div className="p-3 bg-[var(--card)] rounded-lg border border-[var(--border)] text-left text-xs space-y-1">
                <p className="font-semibold text-[var(--foreground)]">Instruksi Transfer Bank Manual:</p>
                <p className="whitespace-pre-wrap text-[var(--muted-foreground)]">{event.paymentInfo}</p>
              </div>
            )}

            {/* Confirmation form */}
            <form onSubmit={handleSaveRef} className="pt-3 border-t border-amber-500/20 text-left space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="refInput" className="text-xs font-semibold text-[var(--foreground)]">
                  Konfirmasi Nomor Invoice / Referensi Pembayaran
                </label>
                {currentRef && (
                  <span className="text-[11px] text-emerald-600 font-medium">✓ Tersimpan</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  id="refInput"
                  type="text"
                  placeholder="Masukkan No. Invoice / Referensi DOKU Anda"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  className="flex-1 rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
                />
                <Button type="submit" size="sm" disabled={savingRef || !refInput.trim()}>
                  {savingRef ? "Menyimpan…" : "Simpan"}
                </Button>
              </div>
              {savedMsg && (
                <p className="text-[11px] text-emerald-600 font-medium">{savedMsg}</p>
              )}
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Setelah Anda menyelesaikan pembayaran di DOKU, simpan nomor invoice / referensi transaksi Anda di atas untuk mempermudah panitia memverifikasi tiket Anda.
              </p>
            </form>
          </div>
        )}

        {/* QR */}
        <div className="px-6 py-8 bg-white flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImage}
            alt={`QR code for ticket ${ticketCode}`}
            width={240}
            height={240}
            className="mb-4"
          />
          <p className="text-2xl font-mono tracking-wider text-center text-black">
            {ticketCode}
          </p>
        </div>

        {/* Event details */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Event</p>
            <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
              {event.title}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Date</p>
              <p className="text-sm">
                {formatInTimeZone(event.startAt, "Asia/Jakarta", "d MMM yyyy")}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {formatInTimeZone(event.startAt, "Asia/Jakarta", "HH:mm")} WIB
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Venue</p>
              <p className="text-sm">
                {event.isOnline ? "Online" : event.locationName ?? "[LOCATION]"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Name</p>
              <p className="text-sm">{fullName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Email</p>
              <p className="text-sm">{email}</p>
            </div>
          </div>

          {checkIn && (
            <div className="border-t border-[var(--border)] pt-4">
              <Badge variant="info">
                Checked in at {formatInTimeZone(checkIn.checkedInAt, "Asia/Jakarta", "HH:mm")} WIB
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Download buttons */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => handleDownload("pdf")}
            disabled={downloading}
            variant="outline"
            className="flex-1"
          >
            {downloading ? "Generating…" : "Download PDF"}
          </Button>
          <Button
            onClick={() => handleDownload("png")}
            disabled={downloading}
            variant="outline"
            className="flex-1"
          >
            {downloading ? "Generating…" : "Download Image"}
          </Button>
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Present this QR code at the venue entrance.
        </p>
      </div>
    </>
  );
}
