import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { formatInTimeZone } from "date-fns-tz";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  if (!["confirm", "reject"].includes(action)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid action" } }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          title: true,
          slug: true,
          startAt: true,
          locationName: true,
          isOnline: true,
          priceIDR: true,
        },
      },
    },
  });

  if (!registration) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Registration not found" } }, { status: 404 });
  }

  if (registration.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: { code: "INVALID_STATUS", message: "Registration is not pending payment" } }, { status: 400 });
  }

  const newStatus = action === "confirm" ? "CONFIRMED" : "REJECTED";

  await prisma.registration.update({
    where: { id },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      action: action === "confirm" ? "PAYMENT_CONFIRMED" : "PAYMENT_REJECTED",
      entityType: "Registration",
      entityId: id,
      metadata: {
        actorId: session.user.id,
        actorEmail: session.user.email,
      },
    },
  });

  // Send email notification
  const eventDate = formatInTimeZone(registration.event.startAt, "Asia/Jakarta", "EEEE, d MMMM yyyy");
  const eventTime = formatInTimeZone(registration.event.startAt, "Asia/Jakarta", "HH:mm");
  const venue = registration.event.isOnline ? "Online" : registration.event.locationName ?? "TBA";
  const ticketUrl = `https://tiket.indfir.com/t/${registration.ticketCode}`;

  if (action === "confirm") {
    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">HAAJ</h1>
          <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Event Ticketing</p>
        </div>
        <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="font-size: 20px; margin: 0 0 16px 0;">Payment Confirmed!</h2>
          <p style="color: #333; line-height: 1.6;">
            Hi ${registration.fullName},<br><br>
            Your payment for <strong>${registration.event.title}</strong> has been confirmed. Your registration is now complete!
          </p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${registration.event.title}</p>
            <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${eventDate}</p>
            <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${eventTime} WIB</p>
            <p style="margin: 0 0 8px 0;"><strong>Venue:</strong> ${venue}</p>
            <p style="margin: 0;"><strong>Ticket Code:</strong> ${registration.ticketCode}</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${ticketUrl}" style="background: #B48E5A; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
              View Your Ticket
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Please present your ticket QR code at the venue entrance for check-in.
          </p>
        </div>
        <div style="background: #1a1a1a; padding: 16px 24px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            Himpunan Astronomi Amatir Jakarta · Est. 1984
          </p>
        </div>
      </div>
    `;

    const text = `
Hi ${registration.fullName},

Your payment for ${registration.event.title} has been confirmed. Your registration is now complete!

Event: ${registration.event.title}
Date: ${eventDate}
Time: ${eventTime} WIB
Venue: ${venue}
Ticket Code: ${registration.ticketCode}

View your ticket: ${ticketUrl}

Please present your ticket QR code at the venue entrance for check-in.

--
Himpunan Astronomi Amatir Jakarta · Est. 1984
    `;

    await sendEmail({
      to: registration.email,
      subject: `Payment Confirmed: ${registration.event.title}`,
      html,
      text,
    });
  } else {
    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">HAAJ</h1>
          <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Event Ticketing</p>
        </div>
        <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="font-size: 20px; margin: 0 0 16px 0;">Payment Issue</h2>
          <p style="color: #333; line-height: 1.6;">
            Hi ${registration.fullName},<br><br>
            Unfortunately, we could not verify your payment for <strong>${registration.event.title}</strong>.
          </p>
          <p style="color: #333; line-height: 1.6;">
            Please re-upload your payment proof or contact us at humas.haaj84@gmail.com for assistance.
          </p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <p style="margin: 0;"><strong>Registration ID:</strong> ${registration.ticketCode}</p>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you have already made the payment, please ensure the proof clearly shows the transfer details.
          </p>
        </div>
        <div style="background: #1a1a1a; padding: 16px 24px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            Himpunan Astronomi Amatir Jakarta · Est. 1984
          </p>
        </div>
      </div>
    `;

    const text = `
Hi ${registration.fullName},

Unfortunately, we could not verify your payment for ${registration.event.title}.

Please re-upload your payment proof or contact us at humas.haaj84@gmail.com for assistance.

Registration ID: ${registration.ticketCode}

If you have already made the payment, please ensure the proof clearly shows the transfer details.

--
Himpunan Astronomi Amatir Jakarta · Est. 1984
    `;

    await sendEmail({
      to: registration.email,
      subject: `Payment Issue: ${registration.event.title}`,
      html,
      text,
    });
  }

  return NextResponse.json({ success: true, newStatus });
}
