import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `HAAJ-${seg(4)}-${seg(4)}`;
}

const registrationSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(1).max(50),
  instagram: z.string().max(100).optional(),
  isHaajMember: z.boolean().default(false),
  memberNumber: z.string().max(50).optional(),
  answers: z.record(z.string(), z.string()).optional(),
  paymentProof: z.string().optional(),
  paymentRef: z.string().max(100).optional(),
  paymentMethod: z.string().max(50).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Event not found" } }, { status: 404 });
  }

  const now = new Date();

  if (event.registrationOpensAt && new Date(event.registrationOpensAt) > now) {
    return NextResponse.json({ error: { code: "REG_NOT_OPEN", message: "Registration is not yet open" } }, { status: 400 });
  }

  if (event.registrationClosesAt && new Date(event.registrationClosesAt) < now) {
    return NextResponse.json({ error: { code: "REG_CLOSED", message: "Registration is closed" } }, { status: 400 });
  }

  const isFull = event.capacity ? event._count.registrations >= event.capacity : false;

  if (isFull && !event.allowWaitlist) {
    return NextResponse.json({ error: { code: "FULL", message: "Event is fully booked" } }, { status: 400 });
  }

  const body = await req.json();
  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { fullName, email, phone, instagram, isHaajMember, memberNumber, answers, paymentProof, paymentRef, paymentMethod } = parsed.data;

  const existing = await prisma.registration.findUnique({
    where: { eventId_email: { eventId: event.id, email } },
  });

  if (existing) {
    return NextResponse.json(
      { error: { code: "DUPLICATE", message: "This email is already registered for this event" } },
      { status: 409 }
    );
  }

  let status: "CONFIRMED" | "WAITLISTED" | "PENDING" | "PENDING_PAYMENT" = "CONFIRMED";
  if (isFull && event.allowWaitlist) {
    status = "WAITLISTED";
  } else if (event.priceIDR > 0) {
    status = "PENDING_PAYMENT";
  } else if (event.requiresApproval) {
    status = "PENDING";
  }

  const resolvedPaymentMethod =
    paymentMethod ||
    (event.priceIDR > 0
      ? event.paymentLink
        ? "DOKU_PAYMENT_LINK"
        : "MANUAL_TRANSFER"
      : undefined);

  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      ticketCode: generateTicketCode(),
      fullName,
      email,
      phone,
      instagram,
      isHaajMember,
      memberNumber,
      answers: answers ?? undefined,
      paymentProof: paymentProof ?? undefined,
      paymentRef: paymentRef ?? undefined,
      paymentMethod: resolvedPaymentMethod,
      status,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "REGISTRATION_CREATED",
      entityType: "Registration",
      entityId: registration.id,
      metadata: { eventId: event.id, email, status },
    },
  });

  return NextResponse.json({ registration }, { status: 201 });
}
