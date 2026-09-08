import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import crypto from "crypto";
import { TicketCard } from "@/components/public/ticket-card";

function signPayload(payload: Record<string, unknown>): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", process.env.HMAC_SECRET ?? "dev-hmac-secret");
  hmac.update(data);
  return hmac.digest("hex");
}

interface Props {
  params: Promise<{ ticketCode: string }>;
}

export default async function TicketPage({ params }: Props) {
  const { ticketCode } = await params;

  const registration = await prisma.registration.findUnique({
    where: { ticketCode },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
          locationName: true,
          isOnline: true,
          priceIDR: true,
          paymentLink: true,
          paymentInfo: true,
        },
      },
      checkIn: true,
    },
  });

  if (!registration) notFound();

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

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <TicketCard
          ticketCode={registration.ticketCode}
          status={registration.status}
          fullName={registration.fullName}
          email={registration.email}
          event={registration.event}
          checkIn={registration.checkIn}
          qrImage={qrImage}
          paymentRef={registration.paymentRef}
        />
      </div>
    </div>
  );
}
