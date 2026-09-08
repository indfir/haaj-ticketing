import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";
import crypto from "crypto";

function signPayload(payload: Record<string, unknown>): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", process.env.HMAC_SECRET ?? "dev-hmac-secret");
  hmac.update(data);
  return hmac.digest("hex");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const registration = await prisma.registration.findUnique({
    where: { ticketCode: code },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          startAt: true,
          endAt: true,
          locationName: true,
          isOnline: true,
        },
      },
    },
  });

  if (!registration) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Ticket not found" } }, { status: 404 });
  }

  const qrPayload = {
    ticketCode: registration.ticketCode,
    eventId: registration.event.id,
    iat: Date.now(),
  };

  const signature = signPayload(qrPayload);
  const qrData = JSON.stringify({ ...qrPayload, sig: signature });
  const qrImage = await QRCode.toDataURL(qrData, {
    width: 400,
    margin: 2,
    color: { dark: "#1a1a19", light: "#ffffff" },
  });

  return NextResponse.json({
    registration: {
      ticketCode: registration.ticketCode,
      fullName: registration.fullName,
      email: registration.email,
      status: registration.status,
      event: registration.event,
    },
    qrImage,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json();
  const { paymentRef, paymentProof } = body;

  const registration = await prisma.registration.findUnique({
    where: { ticketCode: code },
  });

  if (!registration) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Ticket not found" } }, { status: 404 });
  }

  const updated = await prisma.registration.update({
    where: { ticketCode: code },
    data: {
      paymentRef: paymentRef !== undefined ? (paymentRef?.trim() || null) : registration.paymentRef,
      paymentProof: paymentProof !== undefined ? paymentProof : registration.paymentProof,
    },
  });

  return NextResponse.json({ registration: updated });
}

