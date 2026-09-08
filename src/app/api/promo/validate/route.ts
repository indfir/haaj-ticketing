import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, eventId } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promo) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  if (!promo.isActive) {
    return NextResponse.json({ error: "Code is no longer active" }, { status: 400 });
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "Code has expired" }, { status: 400 });
  }

  if (promo.eventId && promo.eventId !== eventId) {
    return NextResponse.json({ error: "Code not valid for this event" }, { status: 400 });
  }

  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: "Code has reached maximum uses" }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    discount: promo.discount,
    code: promo.code,
  });
}

export async function POST_INCREMENT(req: NextRequest) {
  const { code } = await req.json();

  await prisma.promoCode.update({
    where: { code },
    data: { usedCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
