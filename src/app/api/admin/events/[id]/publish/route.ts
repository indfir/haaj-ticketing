import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Event not found" } }, { status: 404 });
  }

  if (event.status !== "DRAFT") {
    return NextResponse.json(
      { error: { code: "INVALID_STATUS", message: "Only DRAFT events can be published" } },
      { status: 400 }
    );
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "EVENT_PUBLISHED",
      entityType: "Event",
      entityId: id,
      metadata: { previousStatus: "DRAFT", newStatus: "PUBLISHED" },
    },
  });

  return NextResponse.json({ event: updated });
}
