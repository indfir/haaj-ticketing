import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const body = await req.json();
  const { code, discount, maxUses, expiresAt, eventId } = body;

  if (!code || !discount) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Code and discount are required" } }, { status: 400 });
  }

  if (discount < 1 || discount > 100) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Discount must be between 1 and 100" } }, { status: 400 });
  }

  // Check if code already exists
  const existing = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (existing) {
    return NextResponse.json({ error: { code: "CONFLICT", message: "Code already exists" } }, { status: 409 });
  }

  const promoCode = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase(),
      discount: parseInt(discount),
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      eventId: eventId || null,
    },
    include: {
      event: { select: { title: true } },
    },
  });

  return NextResponse.json(promoCode);
}
