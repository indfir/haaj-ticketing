import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      body = Object.fromEntries(params.entries());
    }

    const orderObj = (body.order as Record<string, unknown>) || {};
    const transactionObj = (body.transaction as Record<string, unknown>) || {};

    const invoiceNumber = (
      orderObj.invoice_number ||
      body.invoice_number ||
      body.TRANSIDMERCHANT ||
      body.ticket_code ||
      body.ticketCode ||
      ""
    ) as string;

    const statusStr = String(
      transactionObj.status ||
      body.status ||
      body.RESULTMSG ||
      body.transaction_status ||
      ""
    ).toUpperCase();

    const paymentChannel = String(
      body.channel ||
      body.payment_channel ||
      body.PAYMENTCHANNEL ||
      transactionObj.channel ||
      "DOKU"
    );

    await prisma.auditLog.create({
      data: {
        action: "DOKU_WEBHOOK_RECEIVED",
        entityType: "Payment",
        entityId: invoiceNumber || "UNKNOWN",
        metadata: JSON.parse(
          JSON.stringify({
            headers: {
              clientId: req.headers.get("client-id"),
              requestId: req.headers.get("request-id"),
            },
            body,
          })
        ),
      },
    });

    if (!invoiceNumber) {
      return NextResponse.json({ message: "No invoice number found in payload" }, { status: 200 });
    }

    const registration = await prisma.registration.findFirst({
      where: {
        OR: [
          { ticketCode: invoiceNumber },
          { paymentRef: invoiceNumber },
          { id: invoiceNumber },
        ],
      },
      include: { event: true },
    });

    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found for this invoice", invoiceNumber },
        { status: 200 }
      );
    }

    const isSuccess =
      statusStr === "SUCCESS" ||
      statusStr === "SUCCESSFUL" ||
      statusStr === "0000" ||
      statusStr === "PAID" ||
      statusStr === "SETTLEMENT";

    if (isSuccess && registration.status !== "CONFIRMED") {
      await prisma.registration.update({
        where: { id: registration.id },
        data: {
          status: "CONFIRMED",
          paidAt: new Date(),
          paymentRef: invoiceNumber,
          paymentMethod: `DOKU_${paymentChannel}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "DOKU_PAYMENT_CONFIRMED",
          entityType: "Registration",
          entityId: registration.id,
          metadata: {
            ticketCode: registration.ticketCode,
            invoiceNumber,
            status: statusStr,
            paymentChannel,
          },
        },
      });
    }

    return NextResponse.json({ status: "SUCCESS", invoiceNumber }, { status: 200 });
  } catch (err) {
    console.error("DOKU Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "OK", service: "DOKU Webhook Endpoint" });
}
