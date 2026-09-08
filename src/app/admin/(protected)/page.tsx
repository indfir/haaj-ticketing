import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";
import { RegistrationTrendChart, CategoryBreakdownChart } from "@/components/admin/charts";
import { LiveCheckInFeed } from "@/components/admin/live-checkin-feed";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const now = new Date();

  const [
    totalEvents,
    upcomingEvents,
    totalRegistrations,
    pendingApprovals,
    waitlistedCount,
    checkedInToday,
    totalRevenue,
    recentRegistrations,
    recentAuditLogs,
    upcomingEventsList,
    registrationTrend,
    categoryBreakdown,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({
      where: {
        status: "PUBLISHED",
        startAt: { gte: now },
      },
    }),
    prisma.registration.count(),
    prisma.registration.count({
      where: { status: "PENDING" },
    }),
    prisma.registration.count({
      where: { status: "WAITLISTED" },
    }),
    prisma.checkIn.count({
      where: {
        checkedInAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    }),
    prisma.registration.findMany({
      where: { status: "CONFIRMED" },
      select: {
        event: { select: { priceIDR: true } },
      },
    }).then((regs) => regs.reduce((sum, r) => sum + (r.event.priceIDR || 0), 0)),
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { event: { select: { title: true, slug: true } } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { name: true } } },
    }),
    prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        startAt: { gte: now },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      include: {
        _count: { select: { registrations: true } },
      },
    }),
    // Registration trend - last 30 days
    prisma.registration.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true },
    }).then((regs) => {
      const trend: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = date.toISOString().split("T")[0];
        trend[key] = 0;
      }
      regs.forEach((reg) => {
        const key = reg.createdAt.toISOString().split("T")[0];
        if (trend[key] !== undefined) trend[key]++;
      });
      return Object.entries(trend).map(([date, count]) => ({ date, count }));
    }),
    // Category breakdown
    prisma.event.findMany({
      select: {
        category: true,
        _count: { select: { registrations: true } },
      },
    }).then((events) => {
      const breakdown: Record<string, number> = {};
      events.forEach((e) => {
        breakdown[e.category] = (breakdown[e.category] || 0) + e._count.registrations;
      });
      return Object.entries(breakdown).map(([category, count]) => ({ category, count }));
    }),
  ]);

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Overview
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Welcome back. Here is what is happening.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/events/create"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
        >
          Create Event
        </Link>
        <Link
          href="/admin/scan"
          className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          Start Scanner
        </Link>
        <Link
          href="/admin/reports"
          className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          View Reports
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
            Total Events
          </p>
          <p className="text-2xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
            {totalEvents}
          </p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
            Upcoming
          </p>
          <p className="text-2xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
            {upcomingEvents}
          </p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
            Registrations
          </p>
          <p className="text-2xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
            {totalRegistrations}
          </p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
            Pending
          </p>
          <p className="text-2xl tabular-nums text-[var(--warning)]" style={{ fontFamily: "var(--font-display)" }}>
            {pendingApprovals}
          </p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
            Checked In Today
          </p>
          <p className="text-2xl tabular-nums text-[var(--success)]" style={{ fontFamily: "var(--font-display)" }}>
            {checkedInToday}
          </p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
            Revenue
          </p>
          <p className="text-lg tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
            Rp {(totalRevenue / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
          <h3 className="text-sm font-medium mb-4">Registration Trend (Last 30 Days)</h3>
          <RegistrationTrendChart data={registrationTrend} />
        </div>
        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--card)]">
          <h3 className="text-sm font-medium mb-4">Registrations by Category</h3>
          <CategoryBreakdownChart data={categoryBreakdown} />
        </div>
      </div>

      {/* Live check-in feed */}
      <div className="mb-8">
        <LiveCheckInFeed title="Live Check-in Feed" />
      </div>

      {/* Upcoming events quick view */}
      {upcomingEventsList.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
              Upcoming Events
            </h2>
            <Link href="/admin/events" className="text-sm text-[var(--accent)] hover:underline">
              View all →
            </Link>
          </div>
          <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] divide-y divide-[var(--border)]">
            {upcomingEventsList.map((event) => (
              <div key={event.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatInTimeZone(event.startAt, "Asia/Jakarta", "d MMM yyyy, HH:mm")} WIB
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right">
                    <p className="text-sm tabular-nums">
                      {event._count.registrations}
                      {event.capacity ? ` / ${event.capacity}` : ""}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">registered</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/events/${event.id}/registrations`}
                      className="text-xs text-[var(--accent)] hover:underline"
                    >
                      Registrants
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent registrations */}
        <div>
          <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Recent Registrations
          </h2>
          <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] divide-y divide-[var(--border)]">
            {recentRegistrations.length === 0 ? (
              <p className="p-6 text-sm text-[var(--muted-foreground)]">No registrations yet.</p>
            ) : (
              recentRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{reg.fullName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{reg.event.title}</p>
                  </div>
                  <Badge variant={
                    reg.status === "CONFIRMED" ? "success" :
                    reg.status === "PENDING" ? "warning" :
                    reg.status === "WAITLISTED" ? "muted" :
                    reg.status === "REJECTED" ? "destructive" : "default"
                  }>
                    {reg.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Recent Activity
          </h2>
          <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] divide-y divide-[var(--border)]">
            {recentAuditLogs.length === 0 ? (
              <p className="p-6 text-sm text-[var(--muted-foreground)]">No activity yet.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="px-5 py-3">
                  <p className="text-sm">
                    <span className="font-medium">{log.actor?.name ?? "System"}</span>
                    {" — "}
                    <span className="text-[var(--muted-foreground)]">{log.action}</span>
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] tabular-nums">
                    {log.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Jakarta" })} WIB
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
