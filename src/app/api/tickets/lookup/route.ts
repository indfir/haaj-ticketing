import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { formatInTimeZone } from "date-fns-tz";

const lookupSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = lookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid email" } },
      { status: 400 }
    );
  }

  const registrations = await prisma.registration.findMany({
    where: { email: parsed.data.email },
    select: {
      ticketCode: true,
      event: { select: { title: true, slug: true, startAt: true, locationName: true, isOnline: true } },
    },
  });

  // Send email with ticket links if registrations exist
  if (registrations.length > 0) {
    const ticketLinks = registrations
      .map((reg) => {
        const date = formatInTimeZone(reg.event.startAt, "Asia/Jakarta", "d MMM yyyy, HH:mm");
        const venue = reg.event.isOnline ? "Online" : reg.event.locationName ?? "TBA";
        return `
          <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 12px 0;">
            <p style="margin: 0 0 8px 0;"><strong>${reg.event.title}</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 14px;">📅 ${date} WIB</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;">📍 ${venue}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;">🎫 Ticket Code: <strong>${reg.ticketCode}</strong></p>
            <a href="https://tiket.indfir.com/t/${reg.ticketCode}" style="display: inline-block; background: #B48E5A; color: #fff; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px;">
              View Your Ticket
            </a>
          </div>
        `;
      })
      .join("");

    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">HAAJ</h1>
          <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Event Ticketing</p>
        </div>
        <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="font-size: 20px; margin: 0 0 16px 0;">Your Ticket Links</h2>
          <p style="color: #333; line-height: 1.6;">
            Hi there,<br><br>
            Here are your ticket links for upcoming events:
          </p>
          ${ticketLinks}
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 24px;">
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
Hi there,

Here are your ticket links:

${registrations.map((reg) => {
  const date = formatInTimeZone(reg.event.startAt, "Asia/Jakarta", "d MMM yyyy, HH:mm");
  return `${reg.event.title}
Date: ${date} WIB
Ticket Code: ${reg.ticketCode}
View: https://tiket.indfir.com/t/${reg.ticketCode}`;
}).join("\n\n")}

Please present your ticket QR code at the venue entrance for check-in.

--
Himpunan Astronomi Amatir Jakarta · Est. 1984
    `;

    await sendEmail({
      to: parsed.data.email,
      subject: `Your HAAJ Event Tickets (${registrations.length} event${registrations.length > 1 ? "s" : ""})`,
      html,
      text,
    });
  }

  // Always return 200 to prevent email enumeration
  return NextResponse.json({
    message: "If registrations exist for this email, ticket links have been sent.",
    count: registrations.length,
  });
}
