"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  waitlisted: number;
  rejected: number;
  cancelled: number;
  checkedIn: number;
  noShow: number;
  members: number;
  nonMembers: number;
  checkInRate: number;
  noShowRate: number;
  timeline: { time: string; count: number }[];
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [eventId, setEventId] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setEventId(p.id));
  }, [params]);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/admin/events/${eventId}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <p className="text-[var(--muted-foreground)]">Loading report…</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <p className="text-[var(--muted-foreground)]">Could not load report.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-2xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Attendance Report
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Real-time attendance and registration breakdown.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/admin/events/${eventId}/registrations`)} className="text-sm">
          View Registrants
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Total</p>
          <p className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{stats.total}</p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Confirmed</p>
          <p className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{stats.confirmed}</p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Checked In</p>
          <p className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{stats.checkedIn}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{stats.checkInRate.toFixed(1)}% rate</p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
          <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">No-Show</p>
          <p className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{stats.noShow}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{stats.noShowRate.toFixed(1)}% rate</p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)] mb-10">
        <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-display)" }}>Status Breakdown</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Confirmed: {stats.confirmed}</Badge>
          <Badge variant="warning">Pending: {stats.pending}</Badge>
          <Badge variant="muted">Waitlisted: {stats.waitlisted}</Badge>
          <Badge variant="destructive">Rejected: {stats.rejected}</Badge>
          <Badge variant="default">Cancelled: {stats.cancelled}</Badge>
        </div>
      </div>

      <Separator className="mb-10" />

      {/* Member breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
          <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-display)" }}>Members vs Non-Members</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">HAAJ Members</span>
              <span className="text-sm font-medium tabular-nums">{stats.members}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Non-Members</span>
              <span className="text-sm font-medium tabular-nums">{stats.nonMembers}</span>
            </div>
            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden flex" role="progressbar" aria-valuenow={stats.total > 0 ? Math.round((stats.members / stats.total) * 100) : 0} aria-valuemin={0} aria-valuemax={100} aria-label="Members proportion">
              <div
                className="h-full bg-[var(--accent)]"
                style={{ width: `${stats.total > 0 ? (stats.members / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
          <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-display)" }}>Check-in Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Attended</span>
              <span className="text-sm font-medium tabular-nums">{stats.checkedIn}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">No-Show</span>
              <span className="text-sm font-medium tabular-nums">{stats.noShow}</span>
            </div>
            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden flex" role="progressbar" aria-valuenow={stats.confirmed > 0 ? Math.round((stats.checkedIn / stats.confirmed) * 100) : 0} aria-valuemin={0} aria-valuemax={100} aria-label="Check-in rate">
              <div
                className="h-full bg-[var(--success)]"
                style={{ width: `${stats.confirmed > 0 ? (stats.checkedIn / stats.confirmed) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator className="mb-10" />

      {/* Check-in timeline chart */}
      <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
        <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Check-in Timeline (per 15 min)
        </h2>
        {stats.timeline.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
            No check-ins yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                labelStyle={{ color: "var(--foreground)" }}
                itemStyle={{ color: "var(--accent)" }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
