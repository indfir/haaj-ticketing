"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatInTimeZone } from "date-fns-tz";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PENDING", label: "Pending" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusVariant: Record<string, "success" | "warning" | "destructive" | "muted" | "default"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  WAITLISTED: "muted",
  REJECTED: "destructive",
  CANCELLED: "destructive",
};

interface Registration {
  id: string;
  ticketCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  isHaajMember: boolean;
  memberNumber: string | null;
  status: string;
  answers: Record<string, string> | null;
  createdAt: string;
  checkIn: { checkedInAt: string; method: string } | null;
}

export default function RegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [eventId, setEventId] = useState<string>("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setEventId(p.id));
  }, [params]);

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    const searchParams = new URLSearchParams({
      page: pagination.page.toString(),
      pageSize: pagination.pageSize.toString(),
      ...(search && { search }),
      ...(statusFilter !== "all" && { status: statusFilter }),
    });

    const res = await fetch(`/api/admin/events/${eventId}/registrations?${searchParams}`);
    const data = await res.json();
    setRegistrations(data.registrations);
    setPagination(data.pagination);
    setLoading(false);
  }, [eventId, pagination.page, pagination.pageSize, search, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  async function handleStatusChange(regId: string, newStatus: string) {
    await fetch(`/api/admin/registrations/${regId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchRegistrations();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === registrations.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(registrations.map((r) => r.id)));
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExport() {
    const params = new URLSearchParams(statusFilter !== "all" ? { status: statusFilter } : {});
    window.open(`/api/admin/events/${eventId}/export?${params}`, "_blank");
  }

  return (
    <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-2xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Registrations
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {pagination.total} registration{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="text-xs sm:text-sm">
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin/events/${eventId}/report`)} className="text-xs sm:text-sm">
            View Report
          </Button>
        </div>
      </div>

      {/* Filters — stack on mobile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <Input
          placeholder="Search name, email, or ticket code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
          aria-label="Search registrations"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
          className="w-full sm:w-48"
          aria-label="Filter by status"
        />
        {selected.size > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
            <span className="text-sm text-[var(--muted-foreground)]">{selected.size} selected</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                for (const id of selected) {
                  await handleStatusChange(id, "CONFIRMED");
                }
                setSelected(new Set());
              }}
            >
              Confirm All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                for (const id of selected) {
                  await handleStatusChange(id, "REJECTED");
                }
                setSelected(new Set());
              }}
            >
              Reject All
            </Button>
          </div>
        )}
      </div>

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[700px]">
          <Table>
          <Thead>
          <Tr>
            <Th className="w-10">
              <input
                type="checkbox"
                checked={selected.size === registrations.length && registrations.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-[var(--border)]"
                aria-label="Select all registrations"
              />
            </Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th>Member</Th>
            <Th>Status</Th>
            <Th>Checked In</Th>
            <Th>Registered</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr>
              <Td colSpan={9} className="text-center py-12 text-[var(--muted-foreground)]">
                Loading…
              </Td>
            </Tr>
          ) : registrations.length === 0 ? (
            <Tr>
              <Td colSpan={9} className="text-center py-12 text-[var(--muted-foreground)]">
                No registrations found.
              </Td>
            </Tr>
          ) : (
            registrations.map((reg) => (
              <>
                <Tr key={reg.id} className="cursor-pointer hover:bg-[var(--muted)]/50" onClick={() => toggleExpand(reg.id)}>
                  <Td>
                    <input
                      type="checkbox"
                      checked={selected.has(reg.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(reg.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-[var(--border)]"
                      aria-label={`Select ${reg.fullName}`}
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {expanded.has(reg.id) ? "▼" : "▶"}
                      </span>
                      <div>
                        <p className="font-medium">{reg.fullName}</p>
                        <p className="text-xs font-mono text-[var(--muted-foreground)]">{reg.ticketCode}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{reg.email}</Td>
                  <Td>{reg.phone ?? "—"}</Td>
                  <Td>{reg.isHaajMember ? <Badge variant="accent">Member</Badge> : "—"}</Td>
                  <Td>
                    <Badge variant={statusVariant[reg.status]}>{reg.status}</Badge>
                  </Td>
                  <Td>
                    {reg.checkIn ? (
                      <Badge variant="info">
                        {formatInTimeZone(new Date(reg.checkIn.checkedInAt), "Asia/Jakarta", "HH:mm")}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td className="tabular-nums">
                    {formatInTimeZone(new Date(reg.createdAt), "Asia/Jakarta", "d MMM yyyy")}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {reg.status === "PENDING" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(reg.id, "CONFIRMED");
                          }}>
                            Confirm
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(reg.id, "REJECTED");
                          }}>
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
                {expanded.has(reg.id) && (
                  <Tr key={`${reg.id}-detail`}>
                    <Td colSpan={9} className="bg-[var(--muted)]/30 px-8 py-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Instagram</p>
                            <p>{reg.instagram ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Member Number</p>
                            <p>{reg.memberNumber ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Registered At</p>
                            <p>{formatInTimeZone(new Date(reg.createdAt), "Asia/Jakarta", "d MMM yyyy, HH:mm")} WIB</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Check-in Method</p>
                            <p>{reg.checkIn?.method ?? "—"}</p>
                          </div>
                        </div>
                        {reg.answers && Object.keys(reg.answers).length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Form Answers</p>
                            <div className="space-y-2">
                              {Object.entries(reg.answers).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <p className="text-xs text-[var(--muted-foreground)]">{key}</p>
                                  <p>{String(value) || "—"}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Td>
                  </Tr>
                )}
              </>
            ))
          )}
        </Tbody>
      </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[var(--muted-foreground)]">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
