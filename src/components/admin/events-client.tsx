"use client";

import { useState } from "react";
import { Badge, Table, Thead, Tbody, Tr, Th, Td, Button } from "@/components/ui";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";

interface Event {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  startAt: Date;
  capacity: number | null;
  _count: { registrations: number };
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "muted" | "default" | "info"> = {
  DRAFT: "muted",
  PUBLISHED: "success",
  CLOSED: "default",
  CANCELLED: "destructive",
  ARCHIVED: "muted",
};

export function EventsClient({ events }: { events: Event[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map((e) => e.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/events/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error?.message ?? "Failed to delete events");
        return;
      }

      // Remove deleted events from list
      window.location.reload();
    } catch (err) {
      alert("Failed to delete events");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div>
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 border border-[var(--border)] rounded-lg bg-[var(--card)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedIds.size} event{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete Selected"}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Delete {selectedIds.size} Event{selectedIds.size !== 1 ? "s" : ""}?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              This action cannot be undone. This will permanently delete the selected events and all associated registrations.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete Events"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[700px]">
          <Table>
            <Thead>
              <Tr>
                <Th className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === events.length && events.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-[var(--border)]"
                    aria-label="Select all events"
                  />
                </Th>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th className="text-right">Registrants</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events.length === 0 ? (
                <Tr>
                  <Td colSpan={7} className="text-center py-12 text-[var(--muted-foreground)]">
                    No events yet. Create your first event.
                  </Td>
                </Tr>
              ) : (
                events.map((event) => (
                  <Tr key={event.id}>
                    <Td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(event.id)}
                        onChange={() => toggleOne(event.id)}
                        className="h-4 w-4 rounded border-[var(--border)]"
                        aria-label={`Select ${event.title}`}
                      />
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="font-medium hover:text-[var(--accent)] transition-colors"
                      >
                        {event.title}
                      </Link>
                      <p className="text-xs text-[var(--muted-foreground)]">/{event.slug}</p>
                    </Td>
                    <Td>
                      <span className="text-sm">{event.category}</span>
                    </Td>
                    <Td>
                      <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
                    </Td>
                    <Td className="tabular-nums">
                      <span className="text-sm">
                        {formatInTimeZone(new Date(event.startAt), "Asia/Jakarta", "d MMM yyyy, HH:mm")} WIB
                      </span>
                    </Td>
                    <Td className="text-right tabular-nums">
                      <Link
                        href={`/admin/events/${event.id}/registrations`}
                        className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
                      >
                        {event._count.registrations}
                        {event.capacity ? ` / ${event.capacity}` : ""}
                      </Link>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/events/${event.id}/registrations`}>Registrations</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/events/${event.id}`}>Edit</Link>
                        </Button>
                        {event.status === "PUBLISHED" && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/events/${event.slug}`}>View</Link>
                          </Button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
