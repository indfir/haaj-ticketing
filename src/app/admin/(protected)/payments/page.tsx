import { prisma } from "@/lib/db";
import { Badge, Button } from "@/components/ui";
import { PaymentVerificationManager } from "@/components/admin/payment-verification-manager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PaymentVerificationPage() {
  const pendingPayments = await prisma.registration.findMany({
    where: { status: "PENDING_PAYMENT" },
    include: {
      event: {
        select: {
          title: true,
          slug: true,
          priceIDR: true,
          paymentInfo: true,
          paymentLink: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Payment Verification
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Verify DOKU payments and manual transfer proofs from participants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://dashboard.doku.com/bo/payment-link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ED1C24] hover:bg-[#d0171e] text-white font-medium text-sm transition-colors shadow-sm"
          >
            <span>DOKU Dashboard ↗</span>
          </a>
        </div>
      </div>

      <PaymentVerificationManager registrations={pendingPayments} />
    </div>
  );
}
