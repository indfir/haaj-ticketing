import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyQrPayload } from "@/lib/qr";
import { z } from "zod";

const checkinSchema = z.object({
  qrPayload: z.string().optional(),
  ticketCode: z.string().optional(),
  eventId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const body = await req.json();
  const parsed = checkinSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input" } },
      { status: 400 }
    );
  }

  const { qrPayload, ticketCode, eventId: bodyEventId } = parsed.data;
  const rawInput = (qrPayload || ticketCode || "").trim();

  if (!rawInput) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Provide qrPayload or ticketCode" } },
      { status: 400 }
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1. Check if rawInput corresponds to a HAAJ Member (Card QR / Member Number)
  // ─────────────────────────────────────────────────────────────
  const member = await prisma.member.findFirst({
    where: {
      OR: [
        { qrCode: rawInput },
        { memberNumber: rawInput },
      ],
    },
  });

  if (member) {
    if (!member.isActive) {
      return NextResponse.json(
        { error: { code: "INACTIVE_MEMBER", message: `Member ${member.fullName} (${member.memberNumber}) is inactive` } },
        { status: 400 }
      );
    }

    // Resolve target event
    let targetEvent = null;
    if (bodyEventId) {
      targetEvent = await prisma.event.findUnique({
        where: { id: bodyEventId },
        select: { id: true, title: true },
      });
    }

    // If no event specified, pick the closest upcoming or published event
    if (!targetEvent) {
      targetEvent = await prisma.event.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: { startAt: "asc" },
        select: { id: true, title: true },
      });
    }

    if (!targetEvent) {
      return NextResponse.json(
        { error: { code: "EVENT_REQUIRED", message: "Please select an Event / PRU Session first for member attendance" } },
        { status: 400 }
      );
    }

    // Check if already checked in for this event
    const existingAttendance = await prisma.memberAttendance.findUnique({
      where: {
        memberId_eventId: {
          memberId: member.id,
          eventId: targetEvent.id,
        },
      },
      include: {
        event: { select: { id: true, title: true } },
      },
    });

    if (existingAttendance) {
      return NextResponse.json({
        alreadyCheckedIn: true,
        isMember: true,
        checkIn: {
          id: existingAttendance.id,
          checkedInAt: existingAttendance.checkedInAt,
          method: existingAttendance.method,
        },
        member: {
          id: member.id,
          fullName: member.fullName,
          memberNumber: member.memberNumber,
          cluster: member.cluster,
          batch: member.batch,
          qrCode: member.qrCode,
        },
        registration: {
          ticketCode: member.memberNumber,
          fullName: member.fullName,
          email: member.email || `${member.memberNumber}@haaj.id`,
          status: "CONFIRMED",
          event: existingAttendance.event,
        },
      });
    }

    // Record new member attendance
    try {
      const attendance = await prisma.memberAttendance.create({
        data: {
          memberId: member.id,
          eventId: targetEvent.id,
          checkedInById: session.user.id,
          method: qrPayload ? "QR" : "MANUAL",
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "MEMBER_CHECKIN",
          entityType: "MemberAttendance",
          entityId: attendance.id,
          metadata: {
            memberId: member.id,
            memberNumber: member.memberNumber,
            eventId: targetEvent.id,
            method: qrPayload ? "QR" : "MANUAL",
          },
        },
      });

      return NextResponse.json({
        alreadyCheckedIn: false,
        isMember: true,
        checkIn: {
          id: attendance.id,
          checkedInAt: attendance.checkedInAt,
          method: attendance.method,
        },
        member: {
          id: member.id,
          fullName: member.fullName,
          memberNumber: member.memberNumber,
          cluster: member.cluster,
          batch: member.batch,
          qrCode: member.qrCode,
        },
        registration: {
          ticketCode: member.memberNumber,
          fullName: member.fullName,
          email: member.email || `${member.memberNumber}@haaj.id`,
          status: "CONFIRMED",
          event: targetEvent,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message?.includes("Unique constraint")) {
        const existing = await prisma.memberAttendance.findUnique({
          where: { memberId_eventId: { memberId: member.id, eventId: targetEvent.id } },
        });
        return NextResponse.json({
          alreadyCheckedIn: true,
          isMember: true,
          checkIn: existing ? {
            id: existing.id,
            checkedInAt: existing.checkedInAt,
            method: existing.method,
          } : null,
          member: {
            id: member.id,
            fullName: member.fullName,
            memberNumber: member.memberNumber,
            cluster: member.cluster,
            batch: member.batch,
            qrCode: member.qrCode,
          },
          registration: {
            ticketCode: member.memberNumber,
            fullName: member.fullName,
            email: member.email || `${member.memberNumber}@haaj.id`,
            status: "CONFIRMED",
            event: targetEvent,
          },
        });
      }
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Check Standard Event Ticket (Signed JSON QR or Ticket Code)
  // ─────────────────────────────────────────────────────────────
  let resolvedTicketCode: string = rawInput;
  let resolvedEventId: string = bodyEventId ?? "";

  if (qrPayload) {
    let signed: { ticketCode: string; eventId: string; iat: number; sig: string } | null = null;
    try {
      signed = JSON.parse(qrPayload);
    } catch {
      // If not JSON, treat as plain ticket code
      signed = null;
    }

    if (signed && signed.sig && signed.sig !== "manual") {
      const verification = verifyQrPayload(signed);
      if (!verification.valid) {
        return NextResponse.json(
          { error: { code: "INVALID_QR", message: verification.reason ?? "Invalid QR signature" } },
          { status: 400 }
        );
      }
      resolvedTicketCode = signed.ticketCode;
      resolvedEventId = signed.eventId;
    } else if (signed && signed.ticketCode) {
      resolvedTicketCode = signed.ticketCode;
      resolvedEventId = signed.eventId || resolvedEventId;
    }
  }

  const registration = await prisma.registration.findUnique({
    where: { ticketCode: resolvedTicketCode },
    include: {
      event: { select: { id: true, title: true } },
      checkIn: true,
    },
  });

  if (!registration) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `QR Code / Ticket "${rawInput}" not found (not a registered ticket or member card)` } },
      { status: 404 }
    );
  }

  if (resolvedEventId && registration.event.id !== resolvedEventId) {
    return NextResponse.json(
      { error: { code: "WRONG_EVENT", message: `This ticket is registered for a different event: ${registration.event.title}` } },
      { status: 400 }
    );
  }

  if (registration.status === "CANCELLED" || registration.status === "REJECTED") {
    return NextResponse.json(
      { error: { code: "INVALID_STATUS", message: `Registration status is ${registration.status.toLowerCase()}` } },
      { status: 400 }
    );
  }

  // Idempotent check-in
  if (registration.checkIn) {
    return NextResponse.json({
      alreadyCheckedIn: true,
      isMember: registration.isHaajMember,
      checkIn: {
        id: registration.checkIn.id,
        checkedInAt: registration.checkIn.checkedInAt,
        method: registration.checkIn.method,
      },
      registration: {
        ticketCode: registration.ticketCode,
        fullName: registration.fullName,
        email: registration.email,
        status: registration.status,
        event: registration.event,
      },
    });
  }

  // Race-safe creation
  try {
    const checkIn = await prisma.checkIn.create({
      data: {
        registrationId: registration.id,
        checkedInById: session.user.id,
        method: qrPayload ? "QR" : "MANUAL",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CHECKIN",
        entityType: "CheckIn",
        entityId: checkIn.id,
        metadata: {
          registrationId: registration.id,
          ticketCode: registration.ticketCode,
          method: qrPayload ? "QR" : "MANUAL",
        },
      },
    });

    return NextResponse.json({
      alreadyCheckedIn: false,
      isMember: registration.isHaajMember,
      checkIn: {
        id: checkIn.id,
        checkedInAt: checkIn.checkedInAt,
        method: checkIn.method,
      },
      registration: {
        ticketCode: registration.ticketCode,
        fullName: registration.fullName,
        email: registration.email,
        status: registration.status,
        event: registration.event,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message?.includes("Unique constraint")) {
      const existing = await prisma.checkIn.findUnique({
        where: { registrationId: registration.id },
      });
      return NextResponse.json({
        alreadyCheckedIn: true,
        isMember: registration.isHaajMember,
        checkIn: existing ? {
          id: existing.id,
          checkedInAt: existing.checkedInAt,
          method: existing.method,
        } : null,
        registration: {
          ticketCode: registration.ticketCode,
          fullName: registration.fullName,
          email: registration.email,
          status: registration.status,
          event: registration.event,
        },
      });
    }
    throw err;
  }
}

