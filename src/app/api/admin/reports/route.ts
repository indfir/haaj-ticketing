import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");

  let where: any = {};
  if (eventId) {
    where = { eventId };
  }

  const [
    totalRegistrations,
    totalRevenue,
    checkInCount,
    memberRatio,
  ] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where: { ...where, status: "CONFIRMED" },
      select: {
        event: { select: { priceIDR: true } },
      },
    }).then((regs) => regs.reduce((sum, r) => sum + (r.event.priceIDR || 0), 0)),
    prisma.checkIn.count({
      where: eventId ? { registration: { eventId } } : {},
    }),
    prisma.registration.findMany({
      where,
      select: { isHaajMember: true },
    }).then((regs) => {
      const members = regs.filter((r) => r.isHaajMember).length;
      const nonMembers = regs.length - members;
      return { members, nonMembers, total: regs.length };
    }),
  ]);

  // Get category breakdown
  let categoryBreakdown: Array<{ category: string; count: number }>;
  if (eventId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { category: true },
    });
    categoryBreakdown = event ? [{ category: event.category, count: totalRegistrations }] : [];
  } else {
    const events = await prisma.event.findMany({
      select: {
        category: true,
        _count: { select: { registrations: true } },
      },
    });
    const breakdown: Record<string, number> = {};
    events.forEach((e) => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e._count.registrations;
    });
    categoryBreakdown = Object.entries(breakdown).map(([category, count]) => ({ category, count }));
  }

  // Get custom field analysis
  const registrations = await prisma.registration.findMany({
    where,
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

  return NextResponse.json({
    totalRegistrations,
    totalRevenue,
    checkInCount,
    memberRatio,
    categoryBreakdown,
    customFieldAnalysis,
  });
}
