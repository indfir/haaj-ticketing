import { prisma } from "@/lib/db";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { HomeContent } from "@/components/public/home-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();

  const [upcomingEvents, totalRegistrations, pastEventCount] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PUBLISHED", startAt: { gte: now } },
      orderBy: { startAt: "asc" },
      take: 6,
      include: {
        _count: { select: { registrations: true } },
      },
    }),
    prisma.registration.count(),
    prisma.event.count({ where: { status: "PUBLISHED", startAt: { lt: now } } }),
  ]);

  const nextEvent = upcomingEvents[0] ?? null;
  const restEvents = upcomingEvents.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <HomeContent
          nextEvent={nextEvent}
          restEvents={restEvents}
          totalRegistrations={totalRegistrations}
          pastEventCount={pastEventCount}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
