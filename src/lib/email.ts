const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@tiket.indfir.com";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Email not sent.");
    console.log("Would send email to:", options.to);
    console.log("Subject:", options.subject);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Resend API error:", error);
      return { success: false, error: error.message ?? "Failed to send email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export function buildRegistrationConfirmationEmail(data: {
  fullName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketCode: string;
  ticketUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Registration Confirmed: ${data.eventName}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a1a; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; font-size: 24px; margin: 0;">HAAJ</h1>
        <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Event Ticketing</p>
      </div>
      <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e5e5; border-top: none;">
        <h2 style="font-size: 20px; margin: 0 0 16px 0;">Registration Confirmed!</h2>
        <p style="color: #333; line-height: 1.6;">
          Hi ${data.fullName},<br><br>
          Your registration for <strong>${data.eventName}</strong> has been confirmed.
        </p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${data.eventName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${data.eventDate}</p>
          <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${data.eventTime} WIB</p>
          <p style="margin: 0;"><strong>Venue:</strong> ${data.venue}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <p style="font-size: 12px; color: #888; margin: 0 0 8px 0;">Your Ticket Code</p>
          <p style="font-size: 24px; font-family: monospace; letter-spacing: 2px; margin: 0;">${data.ticketCode}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.ticketUrl}" style="background: #B48E5A; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
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
Hi ${data.fullName},

Your registration for ${data.eventName} has been confirmed.

Event: ${data.eventName}
Date: ${data.eventDate}
Time: ${data.eventTime} WIB
Venue: ${data.venue}

Your Ticket Code: ${data.ticketCode}

View your ticket: ${data.ticketUrl}

Please present your ticket QR code at the venue entrance for check-in.

--
Himpunan Astronomi Amatir Jakarta · Est. 1984
  `;

  return { subject, html, text };
}

export function buildEventReminderEmail(data: {
  fullName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketCode: string;
  ticketUrl: string;
  hoursUntil: number;
}): { subject: string; html: string; text: string } {
  const timeText = data.hoursUntil === 24 ? "tomorrow" : `in ${data.hoursUntil} hour${data.hoursUntil > 1 ? "s" : ""}`;
  const subject = `Reminder: ${data.eventName} starts ${timeText}!`;

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a1a; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; font-size: 24px; margin: 0;">HAAJ</h1>
        <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">Event Reminder</p>
      </div>
      <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e5e5; border-top: none;">
        <h2 style="font-size: 20px; margin: 0 0 16px 0;">Event Reminder</h2>
        <p style="color: #333; line-height: 1.6;">
          Hi ${data.fullName},<br><br>
          Just a friendly reminder that <strong>${data.eventName}</strong> starts ${timeText}!
        </p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${data.eventName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${data.eventDate}</p>
          <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${data.eventTime} WIB</p>
          <p style="margin: 0;"><strong>Venue:</strong> ${data.venue}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.ticketUrl}" style="background: #B48E5A; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            View Your Ticket
          </a>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Don't forget to bring your ticket QR code for check-in at the venue.
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
Hi ${data.fullName},

Just a friendly reminder that ${data.eventName} starts ${timeText}!

Event: ${data.eventName}
Date: ${data.eventDate}
Time: ${data.eventTime} WIB
Venue: ${data.venue}

View your ticket: ${data.ticketUrl}

Don't forget to bring your ticket QR code for check-in at the venue.

--
Himpunan Astronomi Amatir Jakarta · Est. 1984
  `;

  return { subject, html, text };
}
