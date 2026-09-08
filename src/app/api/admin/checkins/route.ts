import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");
  const limit = parseInt(url.searchParams.get("limit") ?? "50");

  const where = eventId ? { registration: { eventId } } : {};

  const checkIns = await prisma.checkIn.findMany({
    where,
    orderBy: { checkedInAt: "desc" },
    take: limit,
    include: {
      registration: {
        select: {
          ticketCode: true,
          fullName: true,
          email: true,
          event: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      checkedInBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const formatted = checkIns.map((checkIn) => ({
    id: checkIn.id,
    ticketCode: checkIn.registration.ticketCode,
    fullName: checkIn.registration.fullName,
    email: checkIn.registration.email,
    eventTitle: checkIn.registration.event.title,
    eventSlug: checkIn.registration.event.slug,
    checkedInAt: formatInTimeZone(checkIn.checkedInAt, "Asia/Jakarta", "HH:mm:ss"),
    checkedInAtFull: checkIn.checkedInAt.toISOString(),
    method: checkIn.method,
    staffName: checkIn.checkedInBy?.name ?? "System",
  }));

  return NextResponse.json({ checkIns: formatted });
}
