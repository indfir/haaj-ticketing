import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;

  const [registrations, checkIns] = await Promise.all([
    prisma.registration.findMany({
      where: { eventId: id },
      select: {
        status: true,
        isHaajMember: true,
        createdAt: true,
      },
    }),
    prisma.checkIn.findMany({
      where: { registration: { eventId: id } },
      select: { checkedInAt: true },
    }),
  ]);

  const total = registrations.length;
  const confirmed = registrations.filter((r) => r.status === "CONFIRMED").length;
  const pending = registrations.filter((r) => r.status === "PENDING").length;
  const waitlisted = registrations.filter((r) => r.status === "WAITLISTED").length;
  const rejected = registrations.filter((r) => r.status === "REJECTED").length;
  const cancelled = registrations.filter((r) => r.status === "CANCELLED").length;
  const checkedIn = checkIns.length;
  const noShow = confirmed - checkedIn;
  const members = registrations.filter((r) => r.isHaajMember).length;
  const nonMembers = total - members;

  // Check-in timeline (per 15 min)
  const timeline: Record<string, number> = {};
  for (const ci of checkIns) {
    const date = new Date(ci.checkedInAt);
    const key = `${date.getHours().toString().padStart(2, "0")}:${Math.floor(date.getMinutes() / 15) * 15}`;
    timeline[key] = (timeline[key] ?? 0) + 1;
  }

  return NextResponse.json({
    total,
    confirmed,
    pending,
    waitlisted,
    rejected,
    cancelled,
    checkedIn,
    noShow,
    members,
    nonMembers,
    checkInRate: confirmed > 0 ? (checkedIn / confirmed) * 100 : 0,
    noShowRate: confirmed > 0 ? (noShow / confirmed) * 100 : 0,
    timeline: Object.entries(timeline)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, count]) => ({ time, count })),
  });
}
