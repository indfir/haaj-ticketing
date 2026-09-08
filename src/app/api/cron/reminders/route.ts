import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, buildEventReminderEmail } from "@/lib/email";
import { addHours, subHours } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

// This endpoint should be called by a cron job
// Example: curl https://tiket.indfir.com/api/cron/reminders

export async function GET() {
  const now = new Date();
  const oneDayFromNow = addHours(now, 24);
  const oneHourFromNow = addHours(now, 1);

  // Find events starting in 24 hours
  const eventsIn24h = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startAt: {
        gte: subHours(oneDayFromNow, 1),
        lte: addHours(oneDayFromNow, 1),
      },
    },
    include: {
      registrations: {
        where: {
          status: "CONFIRMED",
        },
        select: {
          email: true,
          fullName: true,
          ticketCode: true,
        },
      },
    },
  });

  // Find events starting in 1 hour
  const eventsIn1h = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startAt: {
        gte: subHours(oneHourFromNow, 1),
        lte: addHours(oneHourFromNow, 1),
      },
    },
    include: {
      registrations: {
        where: {
          status: "CONFIRMED",
        },
        select: {
          email: true,
          fullName: true,
          ticketCode: true,
        },
      },
    },
  });

  const results: Array<{
    to: string;
    subject: string;
    type: "24h" | "1h";
    success: boolean;
    error?: string;
  }> = [];

  // Send 24-hour reminders
  for (const event of eventsIn24h) {
    const eventDate = formatInTimeZone(event.startAt, "Asia/Jakarta", "EEEE, d MMMM yyyy");
    const eventTime = formatInTimeZone(event.startAt, "Asia/Jakarta", "HH:mm");
    const venue = event.isOnline ? "Online" : event.locationName ?? "TBA";

    for (const reg of event.registrations) {
      const ticketUrl = `https://tiket.indfir.com/t/${reg.ticketCode}`;
      const email = buildEventReminderEmail({
        fullName: reg.fullName,
        eventName: event.title,
        eventDate,
        eventTime,
        venue,
        ticketCode: reg.ticketCode,
        ticketUrl,
        hoursUntil: 24,
      });

      const result = await sendEmail({
        to: reg.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      results.push({
        to: reg.email,
        subject: email.subject,
        type: "24h",
        success: result.success,
        error: result.error,
      });
    }
  }

  // Send 1-hour reminders
  for (const event of eventsIn1h) {
    const eventDate = formatInTimeZone(event.startAt, "Asia/Jakarta", "EEEE, d MMMM yyyy");
    const eventTime = formatInTimeZone(event.startAt, "Asia/Jakarta", "HH:mm");
    const venue = event.isOnline ? "Online" : event.locationName ?? "TBA";

    for (const reg of event.registrations) {
      const ticketUrl = `https://tiket.indfir.com/t/${reg.ticketCode}`;
      const email = buildEventReminderEmail({
        fullName: reg.fullName,
        eventName: event.title,
        eventDate,
        eventTime,
        venue,
        ticketCode: reg.ticketCode,
        ticketUrl,
        hoursUntil: 1,
      });

      const result = await sendEmail({
        to: reg.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      results.push({
        to: reg.email,
        subject: email.subject,
        type: "1h",
        success: result.success,
        error: result.error,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return NextResponse.json({
    success: true,
    totalEmails: results.length,
    successCount,
    failCount,
    eventsIn24h: eventsIn24h.length,
    eventsIn1h: eventsIn1h.length,
    results,
  });
}
