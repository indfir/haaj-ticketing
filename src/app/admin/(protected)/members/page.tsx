"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  memberNumber: string;
  qrCode: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  cluster?: string | null;
  batch?: string | null;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
  _count?: {
    attendances: number;
  };
}

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });
  const [clusters, setClusters] = useState<string[]>([]);
  const [batches, setBatches] = useState<string[]>([]);

  // Modal States
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    memberNumber: "",
    qrCode: "",
    cluster: "",
    batch: "",
    email: "",
    phone: "",
    isActive: true,
    notes: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Card Preview State
  const [previewMember, setPreviewMember] = useState<Member | null>(null);
  const [cardSide, setCardSide] = useState<"front" | "back">("front");

  // Feature Guide Banner State
  const [showGuide, setShowGuide] = useState(true);

  // Import Modal State
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importReport, setImportReport] = useState<{
    success?: boolean;
    totalProcessed?: number;
    created?: number;
    updated?: number;
    errors?: { row: number; name: string; error: string }[];
  } | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (selectedCluster) params.set("cluster", selectedCluster);
      if (selectedBatch) params.set("batch", selectedBatch);
      if (selectedStatus) params.set("status", selectedStatus);
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/admin/members?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setPagination(data.pagination || { total: 0, totalPages: 1, limit: 20 });
        if (data.filterOptions?.clusters) setClusters(data.filterOptions.clusters);
        if (data.filterOptions?.batches) setBatches(data.filterOptions.batches);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCluster, selectedBatch, selectedStatus, page]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Generate random QR helper
  const handleGenerateQr = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const seg = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((prev) => ({ ...prev, qrCode: `A-${seg(7)}` }));
  };

  const openAddModal = () => {
    setForm({
      fullName: "",
      memberNumber: "",
      qrCode: "",
      cluster: "",
      batch: new Date().getFullYear().toString(),
      email: "",
      phone: "",
      isActive: true,
      notes: "",
    });
    setFormError("");
    setEditingId(null);
    setModalMode("add");
  };

  const openEditModal = (m: Member) => {
    setForm({
      fullName: m.fullName,
      memberNumber: m.memberNumber,
      qrCode: m.qrCode,
      cluster: m.cluster || "",
      batch: m.batch || "",
      email: m.email || "",
      phone: m.phone || "",
      isActive: m.isActive,
      notes: m.notes || "",
    });
    setFormError("");
    setEditingId(m.id);
    setModalMode("edit");
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const url = modalMode === "add" ? "/api/admin/members" : `/api/admin/members/${editingId}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error?.message || "Failed to save member data");
        return;
      }

      setModalMode(null);
      fetchMembers();
    } catch {
      setFormError("A network error occurred while saving");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMember = async (m: Member) => {
    if (!confirm(`Delete member "${m.fullName}" (${m.memberNumber})? Related attendance data will also be deleted.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/members/${m.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMembers();
      } else {
        alert("Failed to delete member");
      }
    } catch {
      alert("An error occurred while deleting");
    }
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    setImportLoading(true);
    setImportReport(null);

    try {
      const res = await fetch("/api/admin/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: importText }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error?.message || "Import failed to process");
        return;
      }

      setImportReport(data);
      fetchMembers();
    } catch {
      alert("A connection error occurred during import");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-5 border-b border-[var(--border)] bg-[var(--card)] pl-14 lg:pl-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                HAAJ Member Database
              </h1>
              <Badge variant="default" className="text-xs bg-[var(--muted)]">
                {pagination.total} Registered
              </Badge>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Manage member cards, QR codes (hi.events / internal), and PRU attendance history
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/api/admin/members/export"
              download
              className="inline-flex items-center justify-center font-medium text-xs h-9 px-3.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImportOpen(true);
                setImportReport(null);
                setImportText("");
              }}
              className="rounded-lg h-9"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import CSV
            </Button>
            <Button onClick={openAddModal} size="sm" className="rounded-lg h-9 font-semibold">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Member
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Panduan Fitur & Alur Presensi Anggota */}
        <div className="border border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 via-[var(--card)] to-[var(--accent)]/5 rounded-2xl p-5 shadow-xs transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                    HAAJ Member Card Feature Guide & Integration
                  </h2>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                    PRU Attendance System
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-3xl leading-relaxed">
                  Information on how the physical card QR integration (hi.events) works, the automatic attendance flow during General Routine Meetings (PRU), and member data management.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 shrink-0 pt-1 cursor-pointer"
            >
              {showGuide ? "Hide Guide" : "Open Guide"}
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showGuide ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showGuide && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-[var(--border)] text-xs">
              {/* Card 1 */}
              <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-[var(--accent)] font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
                  </svg>
                  <span>1. hi.events Physical Card QR</span>
                </div>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Issued HAAJ physical member cards (e.g. string format <code className="font-mono bg-[var(--muted)] px-1 py-0.5 rounded text-[11px] text-[var(--foreground)]">A-AV5G7B6</code> from hi.events) are <strong>directly compatible</strong>. Simply enter the code in the member's <strong>Card QR Code</strong> field.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>2. PRU Attendance — Just One Scan</span>
                </div>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Members <strong>do not need to re-register every week</strong>. When PRU begins, the committee just opens the <strong>Attendance Scanner</strong> tab, selects the active PRU session, then scans the member card. Attendance is automatically recorded.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
                    <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
                  </svg>
                  <span>3. New Members & QR Printing</span>
                </div>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  For new members, click <strong>+ Add Member</strong> and use the <strong>+ Generate New</strong> button. Click the card 💳 button in the table to view the HAAJ card mockup (front & back) and download the QR code image (PNG).
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>4. Import & Export Data</span>
                </div>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Member data from administrators/Sienik can be bulk imported via the <strong>Import CSV</strong> button (copy-paste from spreadsheet). The entire member database can also be exported anytime via <strong>Export CSV</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="border border-[var(--border)] rounded-2xl p-4 bg-[var(--card)] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <svg className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth={2} />
              <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search name, member no., QR code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Cluster filter */}
            <select
              value={selectedCluster}
              onChange={(e) => {
                setSelectedCluster(e.target.value);
                setPage(1);
              }}
              className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">All Clusters</option>
              {clusters.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Batch filter */}
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setPage(1);
              }}
              className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>Batch {b}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className="border border-[var(--border)] rounded-2xl bg-[var(--card)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-[var(--muted-foreground)] text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Member No.</th>
                  <th className="py-3.5 px-4">Card QR Code</th>
                  <th className="py-3.5 px-4">Cluster</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4 text-center">PRU Attendance</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-[var(--muted-foreground)]">
                      Loading member data...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-[var(--muted-foreground)]">
                      No members matching the search
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {m.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--foreground)] truncate">{m.fullName}</p>
                            {m.email && <p className="text-xs text-[var(--muted-foreground)] truncate">{m.email}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[var(--foreground)]">
                        {m.memberNumber}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--muted)] font-mono text-xs font-bold text-[var(--accent)] border border-[var(--border)]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                            <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                            <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                            <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
                          </svg>
                          {m.qrCode}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {m.cluster ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                            {m.cluster}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-[var(--muted-foreground)]">
                        {m.batch ? `Batch ${m.batch}` : "—"}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Badge variant="muted" className="text-xs font-mono">
                          {m._count?.attendances ?? 0} times
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {m.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-zinc-500">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPreviewMember(m);
                              setCardSide("front");
                            }}
                            title="Preview Kartu & QR Code"
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
                              <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(m)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m)}
                            title="Delete"
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-rose-500/10 text-[var(--muted-foreground)] hover:text-rose-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="py-3 px-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>
                Page {page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg h-8"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="rounded-lg h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: Tambah / Edit Anggota */}
      {/* ───────────────────────────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {modalMode === "add" ? "Add New Member" : "Edit Member Data"}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="E.g.: ADE DEWIJANTI"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-1">
                    Member Number *
                  </label>
                  <Input
                    required
                    placeholder="E.g.: 20258404001"
                    value={form.memberNumber}
                    onChange={(e) => setForm({ ...form, memberNumber: e.target.value })}
                    className="font-mono rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-1">
                    Cluster / Class
                  </label>
                  <Input
                    placeholder="E.g.: CASTOR-POLLUX"
                    value={form.cluster}
                    onChange={(e) => setForm({ ...form, cluster: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Card QR Code (hi.events / Custom)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateQr}
                    className="text-xs text-[var(--accent)] hover:underline font-semibold"
                  >
                    + Generate New
                  </button>
                </div>
                <Input
                  placeholder="E.g.: A-AV5G7B6 (leave empty to auto-generate)"
                  value={form.qrCode}
                  onChange={(e) => setForm({ ...form, qrCode: e.target.value })}
                  className="font-mono rounded-xl"
                />
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                  If the physical card has been printed (e.g. from hi.events), enter the code exactly as shown on the QR.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-1">
                    Batch
                  </label>
                  <Input
                    placeholder="E.g.: 2025"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <Input
                    placeholder="E.g.: 081234567890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="anggota@haaj.id"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[var(--accent)] rounded"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium cursor-pointer">
                  Active Member Status (Eligible to attend PRU and check-in)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)]">
                <Button type="button" variant="outline" onClick={() => setModalMode(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="rounded-xl px-6 font-semibold">
                  {formLoading ? "Saving…" : "Save Data"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: Import CSV Anggota */}
      {/* ───────────────────────────────────────────────────────────── */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Import Member Data (CSV / Sienik / hi.events)
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Copy and paste data from Excel/Spreadsheet files or upload CSV
                </p>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <div className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--muted-foreground)] space-y-1">
              <p className="font-semibold text-[var(--foreground)]">Column Header Format:</p>
              <p className="font-mono text-[11px] bg-[var(--background)] px-2 py-1 rounded border border-[var(--border)]">
                Full Name, Member Number, QR Code, Cluster, Batch, Email, Phone
              </p>
              <p className="text-[11px]">
                * If the <strong>QR Code</strong> column is left empty, the system will automatically generate a unique QR for that member.
              </p>
            </div>

            <div>
              <textarea
                rows={8}
                placeholder={`Full Name,Member Number,QR Code,Cluster,Batch,Email\nADE DEWIJANTI,20258404001,A-AV5G7B6,CASTOR-POLLUX,2025,ade@example.com\nREZKY HAAJ,20258404002,A-RZK88P1,BETELGEUSE,2025,rezky@haaj.id`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {importReport && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
                <p className="font-bold text-sm">Import Result:</p>
                <p>✓ Successfully added: <strong>{importReport.created}</strong> members</p>
                <p>✓ Successfully updated: <strong>{importReport.updated}</strong> members</p>
                {importReport.errors && importReport.errors.length > 0 && (
                  <div className="mt-2 text-rose-600 dark:text-rose-400">
                    <p className="font-semibold">{importReport.errors.length} rows failed:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      {importReport.errors.slice(0, 5).map((e, idx) => (
                        <li key={idx}>Row {e.row} ({e.name}): {e.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button variant="outline" onClick={() => setImportOpen(false)} className="rounded-xl">
                Close
              </Button>
              <Button
                onClick={handleImportSubmit}
                disabled={importLoading || !importText.trim()}
                className="rounded-xl px-6 font-semibold"
              >
                {importLoading ? "Processing Import…" : "Start Import"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: Preview Kartu Anggota HAAJ (Depan & Belakang) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {previewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  HAAJ Member Card
                </h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {previewMember.fullName} • {previewMember.memberNumber}
                </p>
              </div>
              <button
                onClick={() => setPreviewMember(null)}
                className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            {/* Toggle Sisi Depan / Belakang */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-xl bg-[var(--muted)] p-1 border border-[var(--border)]">
                <button
                  onClick={() => setCardSide("front")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    cardSide === "front"
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Front Side
                </button>
                <button
                  onClick={() => setCardSide("back")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    cardSide === "back"
                      ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Back Side (QR Check-In)
                </button>
              </div>
            </div>

            {/* Card Mockup Frame */}
            <div className="flex justify-center">
              {cardSide === "front" ? (
                /* FRONT OF CARD */
                <div
                  className="w-80 h-52 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col justify-between select-none"
                  style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {/* Left blue ribbon with Name */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-blue-700 shadow-md"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    <span className="text-xs font-black tracking-widest text-white uppercase truncate px-2">
                      {previewMember.fullName}
                    </span>
                  </div>

                  {/* Header right: HAAJ Logo text */}
                  <div className="ml-12 flex justify-end items-center">
                    <div className="text-right">
                      <p className="text-[10px] font-bold tracking-widest leading-tight text-blue-300">
                        HIMPUNAN
                      </p>
                      <p className="text-[9px] font-medium tracking-wide text-slate-300">
                        ASTRONOMI AMATIR JAKARTA
                      </p>
                    </div>
                  </div>

                  {/* Middle photo & constellation graphic */}
                  <div className="ml-12 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-2 border-blue-400 bg-slate-800 flex items-center justify-center font-bold text-xl text-blue-300 shadow-inner">
                      {previewMember.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-[10px] text-blue-200">
                        <span>✨</span>
                        <span>{previewMember.batch ? `Batch ${previewMember.batch}` : "HAAJ Member"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom cluster & number */}
                  <div className="ml-12 flex items-end justify-between border-t border-slate-700/60 pt-2">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Cluster</p>
                      <p className="text-xs font-black tracking-wider text-blue-300 uppercase">
                        {previewMember.cluster || "CASTOR-POLLUX"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Member No.</p>
                      <p className="text-xs font-mono font-bold tracking-wider text-white">
                        {previewMember.memberNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* BACK OF CARD */
                <div
                  className="w-80 h-52 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col items-center justify-between select-none bg-white text-slate-800"
                  style={{ border: "1px solid rgba(0,0,0,0.1)" }}
                >
                  <div className="w-full text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-800 border-b border-slate-200 pb-1">
                      SCAN HERE FOR CHECK IN
                    </p>
                  </div>

                  {/* Real QR Code Image */}
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                    <img
                      src={`/api/admin/members/${previewMember.id}/qr`}
                      alt="Member QR Code"
                      className="w-24 h-24 object-contain"
                    />
                  </div>

                  <div className="w-full text-center">
                    <p className="text-xs font-mono font-black text-slate-900 tracking-wider">
                      {previewMember.qrCode}
                    </p>
                    <p className="text-[8px] text-slate-500 mt-0.5 leading-tight">
                      DITERBITKAN TAHUN 2026 OLEH BADAN PENGURUS HAAJ
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions for Card */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <a
                href={`/api/admin/members/${previewMember.id}/qr?download=true`}
                download
                className="inline-flex items-center text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code Image (PNG)
              </a>

              <Button variant="outline" size="sm" onClick={() => setPreviewMember(null)} className="rounded-xl">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
