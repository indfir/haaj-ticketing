"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { CategoryBreakdownChart } from "@/components/admin/charts";
import { formatInTimeZone } from "date-fns-tz";

interface Event {
  id: string;
  title: string;
  slug: string;
}

interface ReportsClientProps {
  events: Event[];
  initialEventId?: string;
  initialData: {
    totalRegistrations: number;
    totalRevenue: number;
    checkInCount: number;
    memberRatio: { members: number; nonMembers: number; total: number };
    categoryBreakdown: Array<{ category: string; count: number }>;
    customFieldAnalysis: Array<{
      fieldName: string;
      values: Array<{ value: string; count: number }>;
    }>;
    registrationTrend: Array<{ date: string; count: number }>;
  };
}

export function ReportsClient({ events, initialEventId, initialData }: ReportsClientProps) {
  const [selectedEventId, setSelectedEventId] = useState(initialEventId ?? "");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleEventChange = async (eventId: string) => {
    setSelectedEventId(eventId);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (eventId) params.set("eventId", eventId);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (res.ok) {
        const newData = await res.json();
        setData(newData);
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkInRate = data.totalRegistrations > 0 ? (data.checkInCount / data.totalRegistrations) * 100 : 0;

  return (
    <div>
      {/* Event selector */}
      <div className="mb-6">
        <label className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2 block">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => handleEventChange(e.target.value)}
          className="w-full sm:w-96 h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]"
        >
          <option value="">All Events (Overview)</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--muted-foreground)]">Loading report data…</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
                Total Registrations
              </p>
              <p className="text-2xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                {data.totalRegistrations}
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
                Total Revenue
              </p>
              <p className="text-xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                Rp {(data.totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
                Check-in Rate
              </p>
              <p className="text-2xl tabular-nums text-[var(--success)]" style={{ fontFamily: "var(--font-display)" }}>
                {checkInRate.toFixed(1)}%
              </p>
            </div>
            <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
                Member Ratio
              </p>
              <p className="text-2xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                {data.memberRatio.total > 0 ? ((data.memberRatio.members / data.memberRatio.total) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
              <h3 className="text-sm font-medium mb-4">Registrations by Category</h3>
              <CategoryBreakdownChart data={data.categoryBreakdown} />
            </div>
            <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
              <h3 className="text-sm font-medium mb-4">Member vs Non-Member</h3>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-8 mb-4">
                    <div>
                      <p className="text-3xl tabular-nums text-[var(--accent)]" style={{ fontFamily: "var(--font-display)" }}>
                        {data.memberRatio.members}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">Members</p>
                    </div>
                    <div className="w-px h-12 bg-[var(--border)]" />
                    <div>
                      <p className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                        {data.memberRatio.nonMembers}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">Non-Members</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)]"
                      style={{ width: `${data.memberRatio.total > 0 ? (data.memberRatio.members / data.memberRatio.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom field analysis */}
          {data.customFieldAnalysis.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Registration Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.customFieldAnalysis.map((field) => (
                  <div key={field.fieldName} className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
                    <h3 className="text-sm font-medium mb-4">{field.fieldName}</h3>
                    <div className="space-y-3">
                      {field.values.map((value) => {
                        const percentage = data.totalRegistrations > 0 ? (value.count / data.totalRegistrations) * 100 : 0;
                        return (
                          <div key={value.value}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-[var(--foreground)]">{value.value || "(empty)"}</span>
                              <span className="text-sm tabular-nums text-[var(--muted-foreground)]">
                                {value.count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[var(--accent)]"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
