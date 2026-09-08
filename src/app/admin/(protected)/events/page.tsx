import { prisma } from "@/lib/db";
import { Button } from "@/components/ui";
import { EventsClient } from "@/components/admin/events-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  return (
    <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
        <div>
          <h1 className="text-2xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Events
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {events.length} event{events.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/admin/events/create">
          <Button className="text-sm">Create Event</Button>
        </Link>
      </div>

      <EventsClient events={events} />
    </div>
  );
}
