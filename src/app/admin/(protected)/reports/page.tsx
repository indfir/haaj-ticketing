import { prisma } from "@/lib/db";
import { ReportsClient } from "@/components/admin/reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { startAt: "desc" },
  });

  // Get initial data (all events overview)
  const [
    totalRegistrations,
    totalRevenue,
    checkInCount,
    categoryBreakdown,
    memberRatio,
  ] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.findMany({
      where: { status: "CONFIRMED" },
      select: {
        event: { select: { priceIDR: true } },
      },
    }).then((regs) => regs.reduce((sum, r) => sum + (r.event.priceIDR || 0), 0)),
    prisma.checkIn.count(),
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
    prisma.registration.findMany({
      select: { isHaajMember: true },
    }).then((regs) => {
      const members = regs.filter((r) => r.isHaajMember).length;
      const nonMembers = regs.length - members;
      return { members, nonMembers, total: regs.length };
    }),
  ]);

  // Get custom field analysis
  const registrations = await prisma.registration.findMany({
    select: {
      answers: true,
    },
  });

  const customFieldAnalysis: Array<{
    fieldName: string;
    values: Array<{ value: string; count: number }>;
  }> = [];

  const fieldCounts: Record<string, Record<string, number>> = {};

  registrations.forEach((reg) => {
    if (reg.answers && typeof reg.answers === "object") {
      Object.entries(reg.answers).forEach(([key, value]) => {
        if (!fieldCounts[key]) {
          fieldCounts[key] = {};
        }
        const strValue = String(value ?? "");
        fieldCounts[key][strValue] = (fieldCounts[key][strValue] || 0) + 1;
      });
    }
  });

  Object.entries(fieldCounts).forEach(([fieldName, values]) => {
    customFieldAnalysis.push({
      fieldName,
      values: Object.entries(values)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    });
  });

  // Get registration trend (last 30 days)
  const now = new Date();
  const trendData = await prisma.registration.findMany({
    where: {
      createdAt: {
        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: { createdAt: true },
  });

  const registrationTrend: Array<{ date: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().split("T")[0];
    registrationTrend.push({ date: key, count: 0 });
  }

  trendData.forEach((reg) => {
    const key = reg.createdAt.toISOString().split("T")[0];
    const existing = registrationTrend.find((t) => t.date === key);
    if (existing) {
      existing.count++;
    }
  });

  const initialData = {
    totalRegistrations,
    totalRevenue,
    checkInCount,
    memberRatio,
    categoryBreakdown,
    customFieldAnalysis,
    registrationTrend,
  };

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Reports
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Analytics and insights across all events.
        </p>
      </div>

      <ReportsClient
        events={events}
        initialEventId=""
        initialData={initialData}
      />
    </div>
  );
}
