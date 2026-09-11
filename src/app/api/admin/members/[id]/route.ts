import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateMemberSchema = z.object({
  fullName: z.string().min(1).optional(),
  memberNumber: z.string().min(1).optional(),
  qrCode: z.string().min(1).optional(),
  cluster: z.string().optional().nullable(),
  batch: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      attendances: {
        orderBy: { checkedInAt: "desc" },
        include: {
          event: { select: { id: true, title: true, slug: true, startAt: true, category: true } },
          checkedInBy: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!member) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Member not found" } }, { status: 404 });
  }

  return NextResponse.json({ member });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateMemberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Check unique collisions if memberNumber or qrCode changed
  if (data.memberNumber) {
    const existing = await prisma.member.findFirst({
      where: { memberNumber: data.memberNumber, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: { code: "DUPLICATE_NUMBER", message: `Member number "${data.memberNumber}" is already in use` } },
        { status: 409 }
      );
    }
  }

  if (data.qrCode) {
    const existing = await prisma.member.findFirst({
      where: { qrCode: data.qrCode, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: { code: "DUPLICATE_QR", message: `QR code "${data.qrCode}" is already in use` } },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.member.update({
    where: { id },
    data: {
      ...data,
      email: data.email === "" ? null : data.email,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "UPDATE_MEMBER",
      entityType: "Member",
      entityId: id,
      metadata: data,
    },
  });

  return NextResponse.json({ member: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  await prisma.member.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "DELETE_MEMBER",
      entityType: "Member",
      entityId: id,
    },
  });

  return NextResponse.json({ success: true });
}
