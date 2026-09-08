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

  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, title: true, startAt: true },
  });

  if (!event) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Event not found" } }, { status: 404 });
  }

  const attendances = await prisma.memberAttendance.findMany({
    where: { eventId: id },
    orderBy: { checkedInAt: "desc" },
    include: {
      member: {
        select: {
          id: true,
          fullName: true,
          memberNumber: true,
          qrCode: true,
          cluster: true,
          batch: true,
          email: true,
          phone: true,
        },
      },
      checkedInBy: {
        select: { name: true, email: true },
      },
    },
  });

  return NextResponse.json({
    event,
    attendances,
    total: attendances.length,
  });
}
