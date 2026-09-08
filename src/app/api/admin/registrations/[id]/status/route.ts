import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "WAITLISTED", "REJECTED", "CANCELLED"]),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid status" } },
      { status: 400 }
    );
  }

  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Registration not found" } }, { status: 404 });
  }

  const updated = await prisma.registration.update({
    where: { id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.notes && { notes: parsed.data.notes }),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "REGISTRATION_STATUS_CHANGE",
      entityType: "Registration",
      entityId: id,
      metadata: {
        previousStatus: registration.status,
        newStatus: parsed.data.status,
        notes: parsed.data.notes,
      },
    },
  });

  return NextResponse.json({ registration: updated });
}
