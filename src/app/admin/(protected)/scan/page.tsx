"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ScanResult = {
  type: "success" | "already" | "error";
  name: string;
  ticketCode: string;
  event: string;
  isMember?: boolean;
  cluster?: string;
  detail?: string;
  timestamp: Date;
};

type PopupState = {
  type: "success" | "already" | "error" | null;
  name: string;
  ticketCode: string;
  event: string;
  isMember?: boolean;
  cluster?: string;
  detail?: string;
};

interface OfflineItem {
  qrPayload?: string;
  ticketCode?: string;
  eventId?: string;
  timestamp: number;
}

interface EventItem {
  id: string;
  title: string;
  startAt: string;
  status: string;
  category: string;
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [online, setOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineItem[]>([]);
  const [cameraError, setCameraError] = useState("");
  const [popup, setPopup] = useState<PopupState | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch events for event picker
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoadingEvents(true);
        const res = await fetch("/api/admin/events");
        if (res.ok) {
          const data = await res.json();
          const evList: EventItem[] = data.events || [];
          setEvents(evList);

          // Restore saved event or pick first active event
          const savedId = localStorage.getItem("haaj_scan_event_id");
          if (savedId && evList.some((e) => e.id === savedId)) {
            setSelectedEventId(savedId);
          } else if (evList.length > 0) {
            setSelectedEventId(evList[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load events for scanner:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    loadEvents();
  }, []);

  const handleEventChange = (id: string) => {
    setSelectedEventId(id);
    localStorage.setItem("haaj_scan_event_id", id);
  };

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (online && offlineQueue.length > 0) {
      const sync = async () => {
        const remaining: OfflineItem[] = [];
        for (const item of offlineQueue) {
          try {
            const res = await fetch("/api/admin/checkin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
            if (!res.ok) remaining.push(item);
          } catch {
            remaining.push(item);
          }
        }
        setOfflineQueue(remaining);
      };
      sync();
    }
  }, [online, offlineQueue]);

  const showPopup = useCallback((state: PopupState) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopup(state);
    popupTimerRef.current = setTimeout(() => {
      setPopup(null);
    }, 3500);
  }, []);

  const processCheckin = useCallback(async (codeOrPayload: string, isManual = false) => {
    const trimmed = codeOrPayload.trim();
    if (!trimmed) return;

    const now = Date.now();
    if (trimmed === lastScanRef.current && now - lastScanTimeRef.current < 3000) {
      return;
    }
    lastScanRef.current = trimmed;
    lastScanTimeRef.current = now;

    if (!online) {
      setOfflineQueue((prev) => [
        ...prev,
        {
          qrPayload: isManual ? undefined : trimmed,
          ticketCode: isManual ? trimmed : undefined,
          eventId: selectedEventId,
          timestamp: now,
        },
      ]);
      showPopup({
        type: "success",
        name: "Antrean Offline",
        ticketCode: trimmed,
        event: "Akan disinkronkan saat koneksi online",
      });
      return;
    }

    try {
      const payloadBody = isManual
        ? { ticketCode: trimmed, eventId: selectedEventId }
        : { qrPayload: trimmed, eventId: selectedEventId };

      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      });

      const data = await res.json();

      if (!res.ok) {
        showPopup({
          type: "error",
          name: "Gagal Check-in",
          ticketCode: trimmed,
          event: data.error?.message ?? "Terjadi kesalahan saat check-in",
        });
        return;
      }

      const isMember = Boolean(data.isMember || data.member);
      const memberName = data.member?.fullName || data.registration?.fullName || "Tamu";
      const codeDisplay = data.member ? `${data.member.memberNumber} (${data.member.qrCode})` : (data.registration?.ticketCode || trimmed);
      const eventTitle = data.event?.title || data.registration?.event?.title || "Event HAAJ";
      const cluster = data.member?.cluster;

      // Haptic feedback if supported on mobile devices
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(data.alreadyCheckedIn ? [100, 50, 100] : 150);
      }

      if (data.alreadyCheckedIn) {
        const timeStr = data.checkIn?.checkedInAt
          ? new Date(data.checkIn.checkedInAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          : "";
        showPopup({
          type: "already",
          name: memberName,
          ticketCode: codeDisplay,
          event: eventTitle,
          isMember,
          cluster,
          detail: `Sudah presensi sebelumnya ${timeStr ? `pukul ${timeStr} WIB` : ""}`,
        });
      } else {
        showPopup({
          type: "success",
          name: memberName,
          ticketCode: codeDisplay,
          event: eventTitle,
          isMember,
          cluster,
          detail: isMember ? "Presensi Anggota Berhasil Dicatat" : "Tiket Valid — Berhasil Masuk",
        });
      }

      setResults((prev) => [
        {
          type: (data.alreadyCheckedIn ? "already" : "success") as "already" | "success",
          name: memberName,
          ticketCode: codeDisplay,
          event: eventTitle,
          isMember,
          cluster,
          detail: data.alreadyCheckedIn
            ? `Sudah presensi ${data.checkIn?.checkedInAt ? new Date(data.checkIn.checkedInAt).toLocaleTimeString("id-ID") : ""}`
            : undefined,
          timestamp: new Date(),
        },
        ...prev.filter((r) => r.ticketCode !== codeDisplay),
      ].slice(0, 30));
    } catch {
      showPopup({
        type: "error",
        name: "Kesalahan Jaringan",
        ticketCode: trimmed,
        event: "Tidak dapat terhubung ke server",
      });
    }
  }, [online, selectedEventId, showPopup]);

  async function startScanner() {
    setCameraError("");
    try {
      const scannerRegion = document.getElementById("scanner-region");
      if (!scannerRegion) throw new Error("Scanner region not found");

      const width = scannerRegion.offsetWidth;
      const qrboxSize = Math.min(280, Math.floor(width * 0.8));

      const scanner = new Html5Qrcode("scanner-region", { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
        },
        (decodedText) => {
          processCheckin(decodedText, false);
        },
        () => {}
      );

      setScanning(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setCameraError(msg);
      showPopup({ type: "error", name: "Camera Error", ticketCode: "—", event: msg });
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setManualLoading(true);
    await processCheckin(manualCode.trim(), true);
    setManualCode("");
    setManualLoading(false);
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        try { scannerRef.current.clear(); } catch {}
      }
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, []);

  const resultStyles = {
    success: "border-[var(--success)]/30 bg-[var(--success)]/5",
    already: "border-[var(--warning)]/30 bg-[var(--warning)]/5",
    error: "border-[var(--destructive)]/30 bg-[var(--destructive)]/5",
  };

  const resultIcons = {
    success: "✓",
    already: "⟳",
    error: "✕",
  };

  const popupConfig = {
    success: {
      bg: "bg-emerald-600",
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Presensi Berhasil!",
    },
    already: {
      bg: "bg-amber-600",
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: "Sudah Pernah Presensi",
    },
    error: {
      bg: "bg-rose-600",
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      title: "Check-in Ditolak",
    },
  };

  const currentEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[var(--border)] bg-[var(--card)] pl-14 lg:pl-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Scanner Presensi & Check-in
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2 w-2 rounded-full ${online ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`} aria-hidden="true" />
              <span className="text-xs text-[var(--muted-foreground)]">
                {online ? "Online" : "Offline — scan akan diantrekan"}
              </span>
              {offlineQueue.length > 0 && (
                <Badge variant="warning">{offlineQueue.length} antrean pending</Badge>
              )}
            </div>
          </div>

          {/* Quick badge */}
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs bg-[var(--muted)]">
              Support QR Kartu Anggota & Tiket Event
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-6">

          {/* Sesi / Event Selector */}
          <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--card)] shadow-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Sesi Acara / Pertemuan (PRU) Aktif
            </label>
            {loadingEvents ? (
              <div className="text-xs text-[var(--muted-foreground)] py-2">Memuat daftar acara...</div>
            ) : events.length === 0 ? (
              <div className="text-xs text-amber-500 py-2">Belum ada acara aktif. Silakan buat acara di menu Events.</div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="flex-1 w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({new Date(ev.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })})
                    </option>
                  ))}
                </select>
                {currentEvent && (
                  <Badge variant="muted" className="text-xs whitespace-nowrap">
                    {currentEvent.category}
                  </Badge>
                )}
              </div>
            )}
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              Kartu anggota yang discan akan otomatis dicatat kehadirannya pada sesi di atas.
            </p>
          </div>

          {/* Camera Viewfinder */}
          <div>
            <div
              className="relative rounded-2xl overflow-hidden bg-black border border-[var(--border)] mx-auto shadow-md"
              style={{ aspectRatio: "1/1", maxHeight: "440px", maxWidth: "440px" }}
            >
              <div id="scanner-region" className="w-full h-full" aria-label="Camera viewfinder for scanning QR codes" />
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white/50">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-white/80 font-medium">Kamera Siap</p>
                  <p className="text-xs text-white/40 mt-1">Arahkan kamera ke QR Code pada kartu anggota atau tiket</p>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-4 p-4 rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5">
                <p className="text-sm text-[var(--destructive)] font-medium">Izin Kamera Diperlukan</p>
                <p className="text-xs text-[var(--destructive)] mt-1">{cameraError}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Pastikan Anda mengakses via HTTPS dan memberikan izin kamera di browser.
                </p>
              </div>
            )}
          </div>

          {/* Scanner Controls */}
          <div>
            {!scanning ? (
              <Button onClick={startScanner} className="w-full h-12 text-base font-semibold rounded-xl shadow-xs">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Aktifkan Kamera Scanner
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="outline" className="w-full h-12 text-base font-semibold rounded-xl">
                <svg className="w-5 h-5 mr-2 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Hentikan Scanner
              </Button>
            )}
          </div>

          {/* Manual Entry */}
          <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)]">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-semibold">
                Input Manual (QR Kartu / Nomor Anggota / Tiket)
              </p>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: A-AV5G7B6, 20258404001, atau HAAJ-XXXX"
                className="font-mono flex-1 rounded-lg"
                aria-label="Manual ticket or member code entry"
              />
              <Button type="submit" disabled={manualLoading || !manualCode.trim()} className="rounded-lg px-5">
                {manualLoading ? "Memproses…" : "Presensi"}
              </Button>
            </form>
          </div>

          {/* Recent Scans Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-semibold">
                Riwayat Presensi Terbaru
              </p>
              <Badge variant="muted">{results.length}</Badge>
            </div>
            <div className="space-y-2">
              {results.length === 0 ? (
                <div className="border border-[var(--border)] rounded-xl p-8 bg-[var(--card)] text-center">
                  <svg className="w-12 h-12 text-[var(--muted-foreground)]/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm text-[var(--muted-foreground)] font-medium">
                    Belum ada presensi yang discan
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Scan kartu anggota atau tiket peserta untuk memulai
                  </p>
                </div>
              ) : (
                results.map((r, i) => (
                  <div
                    key={`${r.ticketCode}-${i}`}
                    className={`border rounded-xl p-4 transition-all duration-300 ${resultStyles[r.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg font-bold mt-0.5" aria-hidden>
                        {resultIcons[r.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-sm font-semibold truncate">{r.name}</p>
                          {r.isMember && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[var(--accent)] text-white rounded-md">
                              Anggota HAAJ
                            </span>
                          )}
                          {r.cluster && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-md">
                              {r.cluster}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-[var(--muted-foreground)]">{r.ticketCode}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">{r.event}</p>
                        {r.detail && (
                          <p className="text-xs text-[var(--warning)] font-medium mt-1">{r.detail}</p>
                        )}
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)] tabular-nums whitespace-nowrap">
                        {r.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Popup Modal */}
      {popup && popup.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className={`${popupConfig[popup.type].bg} rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl text-white transform transition-all duration-200 scale-100`}
            role="alert"
          >
            <div className="flex justify-center mb-4">
              {popupConfig[popup.type].icon}
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">
              {popupConfig[popup.type].title}
            </h2>

            {popup.isMember && (
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                Kartu Anggota Terverifikasi
              </div>
            )}

            <p className="text-xl font-bold mb-1 text-white leading-tight">{popup.name}</p>
            {popup.cluster && (
              <p className="text-xs font-semibold text-white/85 mb-1 tracking-wide">
                Kelompok: {popup.cluster}
              </p>
            )}
            <p className="text-white/70 text-xs font-mono mb-2">{popup.ticketCode}</p>
            <p className="text-white/80 text-xs truncate border-t border-white/20 pt-2 mt-2">{popup.event}</p>

            {popup.detail && (
              <div className="mt-3 p-2 bg-black/20 rounded-lg text-xs font-medium text-white/90">
                {popup.detail}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
