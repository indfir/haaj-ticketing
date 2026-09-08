import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const body = await req.json();
  const { eventIds } = body;

  if (!Array.isArray(eventIds) || eventIds.length === 0) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "eventIds must be a non-empty array" } }, { status: 400 });
  }

  // Delete events and cascade delete related data
  const result = await prisma.event.deleteMany({
    where: {
      id: { in: eventIds },
    },
  });

  return NextResponse.json({
    success: true,
    deletedCount: result.count,
  });
}
