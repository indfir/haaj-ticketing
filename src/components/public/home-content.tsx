"use client";

import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/public/category-icon";
import { Countdown } from "@/components/public/countdown";
import { useLanguage } from "@/lib/language-context";

interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  startAt: Date;
  locationName: string | null;
  isOnline: boolean;
  priceIDR: number;
  capacity: number | null;
  coverImageUrl: string | null;
  _count: { registrations: number };
}

interface HomeContentProps {
  nextEvent: Event | null;
  restEvents: Event[];
  totalRegistrations: number;
  pastEventCount: number;
}

const categoryEmoji: Record<string, string> = {
  OBSERVATION: "\u{1F52D}",
  WORKSHOP: "\u{1F6E0}",
  LECTURE: "\u{1F4D6}",
  STARGAZING: "\u2728",
  MEETUP: "\u{1F465}",
  OTHER: "\u{1F31F}",
};

export function HomeContent({ nextEvent, restEvents, totalRegistrations, pastEventCount }: HomeContentProps) {
  const { t } = useLanguage();

  const totalEvents = pastEventCount + (nextEvent ? 1 : 0) + restEvents.length;

  return (
    <>
      {/* Hero section */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left — text */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)] mb-4 sm:mb-5">
              {t("hero.tagline")}
            </p>
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl leading-[1.08] mb-5 sm:mb-6 animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("hero.title.line1")}
              <br />
              {t("hero.title.line2")}
            </h1>
            <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-md mb-6 sm:mb-8 animate-fade-in stagger-2">
              {t("hero.description")}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 sm:gap-8 mb-8 animate-fade-in stagger-3">
              <div>
                <p className="text-2xl sm:text-3xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                  {totalEvents}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{t("hero.eventsHeld")}</p>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
              <div>
                <p className="text-2xl sm:text-3xl tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                  {totalRegistrations.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{t("hero.registrations")}</p>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
              <div>
                <p className="text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                  40+
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{t("hero.yearsActive")}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in stagger-4">
              <Link
                href="/events"
                className="inline-flex h-11 sm:h-12 items-center justify-center rounded-md bg-[var(--accent)] px-6 text-sm sm:text-base font-medium text-[var(--accent-foreground)] transition-opacity duration-150 hover:opacity-90"
              >
                {t("hero.browseEvents")}
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 sm:h-12 items-center justify-center rounded-md border border-[var(--border)] px-6 text-sm sm:text-base font-medium text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--muted)]"
              >
                {t("hero.aboutHaaj")}
              </Link>
            </div>
          </div>

          {/* Right — featured event card */}
          {nextEvent && (
            <div className="lg:col-span-6 animate-fade-in-up stagger-2">
              <Link href={`/events/${nextEvent.slug}`} className="block group">
                <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] card-hover">
                  <div className="relative aspect-[16/9] bg-[var(--muted)] overflow-hidden">
                    {nextEvent.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={nextEvent.coverImageUrl}
                        alt={nextEvent.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
                        <CategoryIcon category={nextEvent.category} className="w-32 h-32 sm:w-40 sm:h-40 opacity-60" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--background)]/90 backdrop-blur-sm text-[var(--foreground)]">
                        {t("event.nextEvent")}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="accent">{t(`category.${nextEvent.category}`)}</Badge>
                      {nextEvent.priceIDR === 0 && <Badge variant="success">{t("event.free")}</Badge>}
                      {nextEvent.isOnline && <Badge variant="info">{t("event.online")}</Badge>}
                    </div>

                    <h2
                      className="text-xl sm:text-2xl mb-2 group-hover:text-[var(--accent)] transition-colors"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {nextEvent.title}
                    </h2>

                    {nextEvent.subtitle && (
                      <p className="text-sm text-[var(--muted-foreground)] mb-4">{nextEvent.subtitle}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted-foreground)] mb-5">
                      <span>
                        {formatInTimeZone(nextEvent.startAt, "Asia/Jakarta", "d MMM yyyy, HH:mm")} WIB
                      </span>
                      {!nextEvent.isOnline && nextEvent.locationName && (
                        <>
                          <span className="text-[var(--border)]">&middot;</span>
                          <span>{nextEvent.locationName}</span>
                        </>
                      )}
                    </div>

                    <div className="border-t border-[var(--border)] pt-4 mb-4">
                      <Countdown targetDate={nextEvent.startAt} />
                    </div>

                    {nextEvent.capacity && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {nextEvent._count.registrations} {t("event.registered")}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
                            {nextEvent.capacity - nextEvent._count.registrations > 0
                              ? `${nextEvent.capacity - nextEvent._count.registrations} ${t("event.seatsLeft")}`
                              : t("event.fullyBooked")}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              nextEvent._count.registrations / nextEvent.capacity > 0.85
                                ? "capacity-high"
                                : nextEvent._count.registrations / nextEvent.capacity > 0.6
                                  ? "capacity-mid"
                                  : "capacity-low"
                            }`}
                            style={{ width: `${Math.min(100, (nextEvent._count.registrations / nextEvent.capacity) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Category pills */}
      <section className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap mr-1">{t("category.explore")}</span>
            {(["OBSERVATION", "WORKSHOP", "LECTURE", "STARGAZING", "MEETUP", "OTHER"] as const).map((key) => (
              <Link
                key={key}
                href={`/events?category=${key}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors"
              >
                <span>{categoryEmoji[key]}</span>
                {t(`category.${key}`)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming events grid */}
      {restEvents.length > 0 && (
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                {t("event.upcoming")}
              </h2>
              <Link href="/events" className="text-sm text-[var(--accent)] hover:underline">
                {t("event.viewAll")}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {restEvents.map((event, i) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className={`group animate-fade-in stagger-${i + 1}`}
                >
                  <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] card-hover h-full flex flex-col">
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
                          <Badge variant="success">{t("event.free")}</Badge>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--background)]/90 backdrop-blur-sm text-[var(--foreground)]">
                            {t("event.idr")} {event.priceIDR.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="accent">{t(`category.${event.category}`)}</Badge>
                      </div>

                      <h3
                        className="text-base sm:text-lg mb-1 group-hover:text-[var(--accent)] transition-colors"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {event.title}
                      </h3>

                      <p className="text-xs text-[var(--muted-foreground)] mb-3 flex-1">
                        {formatInTimeZone(event.startAt, "Asia/Jakarta", "EEEE, d MMM yyyy \u00B7 HH:mm")} WIB
                        {!event.isOnline && event.locationName && ` \u00B7 ${event.locationName}`}
                      </p>

                      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-3 border-t border-[var(--border)]">
                        <span>
                          {event._count.registrations > 0
                            ? `${event._count.registrations} ${t("event.registered")}`
                            : t("event.beFirst")}
                        </span>
                        {event.capacity && (
                          <span className="tabular-nums">
                            {Math.max(0, event.capacity - event._count.registrations)} {t("event.left")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA section */}
      <section className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {t("cta.title")}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
            {t("cta.description")}
          </p>
          <Link
            href="/ticket/lookup"
            className="inline-flex h-10 sm:h-11 items-center justify-center rounded-md border border-[var(--border)] px-5 text-sm font-medium text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--muted)]"
          >
            {t("cta.findTicket")}
          </Link>
        </div>
      </section>
    </>
  );
}
