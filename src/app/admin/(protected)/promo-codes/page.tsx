import { prisma } from "@/lib/db";
import { PromoCodesManager } from "@/components/admin/promo-codes-manager";

export const dynamic = "force-dynamic";

export default async function PromoCodesPage() {
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { title: true } },
    },
  });

  return (
    <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <PromoCodesManager promoCodes={promoCodes} />
    </div>
  );
}
