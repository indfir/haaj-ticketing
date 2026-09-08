import { prisma } from "@/lib/db";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/public/category-icon";
import { EventSearch } from "@/components/public/event-search";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import type { EventCategory } from "@/generated/prisma/enums";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  OBSERVATION: "Observation",
  WORKSHOP: "Workshop",
  LECTURE: "Lecture",
  STARGAZING: "Stargazing",
  MEETUP: "Meetup",
  OTHER: "Other",
};

const categoryEmoji: Record<string, string> = {
  OBSERVATION: "🔭",
  WORKSHOP: "🛠",
  LECTURE: "📖",
  STARGAZING: "✨",
  MEETUP: "👥",
  OTHER: "🌟",
};

type TimeFilter = "all" | "this-week" | "this-month";

export default async function EventsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; category?: string; time?: string; q?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab ?? "upcoming";
  const category = params.category;
  const timeFilter = (params.time ?? "all") as TimeFilter;
  const searchQuery = params.q?.toLowerCase();

  const isPast = tab === "past";
  const now = new Date();

  let dateFilter: { gte?: Date; lt?: Date; lte?: Date } = {};
  if (isPast) {
    dateFilter = { lt: now };
  } else if (timeFilter === "this-week") {
    dateFilter = { gte: now, lte: endOfWeek(now, { weekStartsOn: 1 }) };
  } else if (timeFilter === "this-month") {
    dateFilter = { gte: now, lte: endOfMonth(now) };
  } else {
    dateFilter = { gte: now };
  }

  let events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startAt: dateFilter,
      ...(category && category !== "all" ? { category: category as EventCategory } : {}),
    },
    orderBy: { startAt: isPast ? "desc" : "asc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  if (searchQuery) {
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(searchQuery) ||
        e.subtitle?.toLowerCase().includes(searchQuery) ||
        e.locationName?.toLowerCase().includes(searchQuery)
    );
  }

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { tab, category, time: timeFilter === "all" ? undefined : params.time, q: params.q, ...overrides };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "all") sp.set(k, v);
    }
    const qs = sp.toString();
    return `/events${qs ? `?${qs}` : ""}`;
  }

  const tabs = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
  ];

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "this-week", label: "This Week" },
    { key: "this-month", label: "This Month" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8 sm:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Events
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Browse upcoming observations, workshops, and gatherings.
              </p>
            </div>
            <Suspense>
              <EventSearch />
            </Suspense>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-1 border-b border-[var(--border)]">
              {tabs.map((t) => (
                <Link
                  key={t.key}
                  href={buildUrl({ tab: t.key, time: undefined })}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === t.key
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </div>

            {/* Temporal filter — only for upcoming */}
            {!isPast && (
              <div className="flex items-center gap-1">
                {timeFilters.map((tf) => (
                  <Link
                    key={tf.key}
                    href={buildUrl({ time: tf.key === "all" ? undefined : tf.key })}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      timeFilter === tf.key
                        ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    {tf.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-4 mb-6 border-b border-[var(--border)]">
            <Link
              href={buildUrl({ category: undefined })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                !category || category === "all"
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]"
              }`}
            >
              All Categories
            </Link>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Link
                key={key}
                href={buildUrl({ category: key })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  category === key
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)]"
                }`}
              >
                <span>{categoryEmoji[key]}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* Results count */}
          <p className="text-xs text-[var(--muted-foreground)] mb-5">
            {events.length} event{events.length !== 1 ? "s" : ""} found
            {searchQuery && <> for &ldquo;{searchQuery}&rdquo;</>}
          </p>

          {/* Events grid */}
          {events.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <p className="text-lg text-[var(--muted-foreground)] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {isPast ? "No past events found." : "No events found."}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {searchQuery
                  ? "Try a different search term or clear filters."
                  : isPast
                    ? "Check back later."
                    : "New events are added regularly — check back soon!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {events.map((event, i) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className={`group animate-fade-in stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] card-hover h-full flex flex-col">
                    {/* Image / illustration */}
                    <div className="relative aspect-[16/10] bg-[var(--muted)] overflow-hidden">
                      {event.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
                          <CategoryIcon category={event.category} className="w-20 h-20 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        {event.priceIDR === 0 ? (
                          <Badge variant="success">Free</Badge>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--background)]/90 backdrop-blur-sm text-[var(--foreground)]">
                            IDR {event.priceIDR.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="accent">{categoryLabels[event.category]}</Badge>
                        {event.isOnline && <Badge variant="info">Online</Badge>}
                      </div>

                      <h2
                        className="text-base sm:text-lg mb-1 group-hover:text-[var(--accent)] transition-colors"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {event.title}
                      </h2>

                      {event.subtitle && (
                        <p className="text-xs text-[var(--muted-foreground)] mb-2 line-clamp-2">{event.subtitle}</p>
                      )}

                      <p className="text-xs text-[var(--muted-foreground)] mb-3 flex-1">
                        {formatInTimeZone(event.startAt, "Asia/Jakarta", "EEE, d MMM yyyy · HH:mm")} WIB
                        {!event.isOnline && event.locationName && (
                          <>
                            <br />
                            {event.locationName}
                          </>
                        )}
                      </p>

                      {/* Social proof + capacity */}
                      <div className="pt-3 border-t border-[var(--border)]">
                        {event.capacity ? (
                          <>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {event._count.registrations} registered
                              </span>
                              <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
                                {Math.max(0, event.capacity - event._count.registrations)} left
                              </span>
                            </div>
                            <div className="h-1 bg-[var(--muted)] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  event._count.registrations / event.capacity > 0.85
                                    ? "capacity-high"
                                    : event._count.registrations / event.capacity > 0.6
                                      ? "capacity-mid"
                                      : "capacity-low"
                                }`}
                                style={{ width: `${Math.min(100, (event._count.registrations / event.capacity) * 100)}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {event._count.registrations > 0
                              ? `${event._count.registrations} registered`
                              : "Be the first to register"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
