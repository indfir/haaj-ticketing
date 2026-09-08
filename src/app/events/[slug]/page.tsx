import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CategoryIcon } from "@/components/public/category-icon";
import { Countdown } from "@/components/public/countdown";
import { RegistrationForm } from "@/components/public/registration-form";
import { StickyRegisterBar } from "@/components/public/sticky-register-bar";
import { ShareButtons } from "@/components/public/share-buttons";
import { AddToCalendar } from "@/components/public/add-to-calendar";
import { WishlistButton } from "@/components/public/wishlist-button";
import { EventCardSkeleton } from "@/components/public/skeleton";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import { Suspense } from "react";
import type { EventCategory } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  OBSERVATION: "Observation",
  WORKSHOP: "Workshop",
  LECTURE: "Lecture",
  STARGAZING: "Stargazing",
  MEETUP: "Meetup",
  OTHER: "Other",
};

interface Props {
  params: Promise<{ slug: string }>;
}

async function RelatedEvents({ currentEventId, category }: { currentEventId: string; category: EventCategory }) {
  const related = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: currentEventId },
      category,
      startAt: { gte: new Date() },
    },
    orderBy: { startAt: "asc" },
    take: 3,
    include: {
      _count: { select: { registrations: true } },
    },
  });

  if (related.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] mt-12 pt-10 sm:pt-14">
      <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8" style={{ fontFamily: "var(--font-display)" }}>
        More {categoryLabels[category]} Events
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {related.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group"
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
                </div>
                <h3
                  className="text-base sm:text-lg mb-1 group-hover:text-[var(--accent)] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {event.title}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mb-3 flex-1">
                  {formatInTimeZone(event.startAt, "Asia/Jakarta", "EEE, d MMM yyyy · HH:mm")} WIB
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-3 border-t border-[var(--border)]">
                  <span>
                    {event._count.registrations > 0
                      ? `${event._count.registrations} registered`
                      : "Be the first to register"}
                  </span>
                  {event.capacity && (
                    <span className="tabular-nums">
                      {Math.max(0, event.capacity - event._count.registrations)} left
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MapEmbed({ locationName, locationAddress }: { locationName: string | null; locationAddress: string | null }) {
  const query = [locationName, locationAddress].filter(Boolean).join(", ");
  if (!query) return null;

  const encodedQuery = encodeURIComponent(query);
  const mapUrl = `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedQuery}&zoom=15`;

  return (
    <div className="mt-4">
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--muted)]" style={{ height: 250 }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing ${locationName ?? locationAddress}`}
        />
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-[var(--accent)] hover:underline mt-2 inline-block"
      >
        Open in Google Maps →
      </a>
    </div>
  );
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      formFields: { orderBy: { sortOrder: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) notFound();

  const isFull = event.capacity ? event._count.registrations >= event.capacity : false;
  const now = new Date();
  const regClosed = event.registrationClosesAt ? new Date(event.registrationClosesAt) < now : false;
  const regNotOpen = event.registrationOpensAt ? new Date(event.registrationOpensAt) > now : false;
  const canRegister = !isFull && !regClosed && !regNotOpen;
  const isUpcoming = event.startAt > now;

  const eventUrl = `https://tiket.indfir.com/events/${event.slug}`;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Cover image / hero */}
        <div className="relative bg-[var(--muted)]">
          {event.coverImageUrl ? (
            <div className="mx-auto max-w-[1200px] aspect-[3/1] sm:aspect-[3/1] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto max-w-[1200px] h-40 sm:h-56 flex items-center justify-center text-[var(--muted-foreground)]">
              <CategoryIcon category={event.category} className="w-24 h-24 sm:w-32 sm:h-32 opacity-40" />
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-6">
            <Link href="/events" className="hover:text-[var(--foreground)] transition-colors">Events</Link>
            <span>/</span>
            <span className="text-[var(--foreground)] truncate">{event.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left — event info */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
                <Badge variant="accent">{categoryLabels[event.category]}</Badge>
                {event.priceIDR === 0 ? (
                  <Badge variant="success">Free</Badge>
                ) : (
                  <Badge variant="info">IDR {event.priceIDR.toLocaleString("id-ID")}</Badge>
                )}
                {event.isOnline && <Badge variant="info">Online</Badge>}
                {event.isMembersOnly && <Badge variant="warning">Members Only</Badge>}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="text-sm sm:text-lg text-[var(--muted-foreground)] mb-6 sm:mb-8">{event.subtitle}</p>
              )}

              {/* Countdown for upcoming events */}
              {isUpcoming && (
                <div className="border border-[var(--border)] rounded-lg p-4 sm:p-5 bg-[var(--card)] mb-6">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Starts in</p>
                  <Countdown targetDate={event.startAt} />
                </div>
              )}

              {/* Date block */}
              <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Start</p>
                    <p className="text-sm font-medium">
                      {formatInTimeZone(event.startAt, "Asia/Jakarta", "EEEE, d MMMM yyyy")}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatInTimeZone(event.startAt, "Asia/Jakarta", "HH:mm")} WIB
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-1">End</p>
                    <p className="text-sm font-medium">
                      {formatInTimeZone(event.endAt, "Asia/Jakarta", "EEEE, d MMMM yyyy")}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatInTimeZone(event.endAt, "Asia/Jakarta", "HH:mm")} WIB
                    </p>
                  </div>
                </div>
              </div>

              {/* Location + Map */}
              {!event.isOnline && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Location</p>
                  <p className="text-sm font-medium">{event.locationName ?? "TBA"}</p>
                  {event.locationAddress && (
                    <p className="text-sm text-[var(--muted-foreground)]">{event.locationAddress}</p>
                  )}
                  <MapEmbed locationName={event.locationName} locationAddress={event.locationAddress} />
                </div>
              )}

              {event.isOnline && (
                <div className="mb-6">
                  <Badge variant="info">Online Event</Badge>
                  {event.onlineUrl && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-2">
                      Link will be shared after registration.
                    </p>
                  )}
                </div>
              )}

              <Separator className="my-6" />

              {/* Description */}
              <div>
                <h2 className="text-lg mb-3" style={{ fontFamily: "var(--font-display)" }}>About this event</h2>
                {event.description ? (
                  <div className="text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
                    {event.description}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)] italic">
                    Event description will be updated soon.
                  </p>
                )}
              </div>

              {/* Contact */}
              {(event.contactPerson || event.contactPhone) && (
                <div className="mt-8">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Contact</p>
                  {event.contactPerson && <p className="text-sm">{event.contactPerson}</p>}
                  {event.contactPhone && <p className="text-sm text-[var(--muted-foreground)]">{event.contactPhone}</p>}
                </div>
              )}

              {/* Share + Calendar + Wishlist */}
              <div className="mt-8 space-y-5">
                <div className="flex items-center gap-3">
                  <WishlistButton eventId={event.id} />
                  <ShareButtons title={event.title} url={eventUrl} />
                </div>
                <AddToCalendar
                  title={event.title}
                  description={event.description ?? undefined}
                  location={!event.isOnline ? event.locationName ?? undefined : undefined}
                  startAt={event.startAt}
                  endAt={event.endAt}
                  url={eventUrl}
                />
              </div>
            </div>

            {/* Right — registration sidebar */}
            <div className="lg:col-span-4 lg:col-start-9">
              <div className="border border-[var(--border)] rounded-lg p-5 sm:p-6 bg-[var(--card)] lg:sticky lg:top-20" id="register">
                {/* Social proof */}
                {event._count.registrations > 0 && (
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--border)]">
                    <div className="flex -space-x-1.5">
                      {Array.from({ length: Math.min(4, event._count.registrations) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-[var(--muted)] border-2 border-[var(--card)] flex items-center justify-center text-[8px] text-[var(--muted-foreground)]"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {event._count.registrations} {event._count.registrations === 1 ? "person" : "people"} registered
                    </span>
                  </div>
                )}

                {/* Capacity */}
                {event.capacity && (
                  <div className="mb-5">
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Seats</p>
                      <p className="text-sm tabular-nums">
                        <span className="font-medium">{event._count.registrations}</span>
                        <span className="text-[var(--muted-foreground)]"> / {event.capacity}</span>
                      </p>
                    </div>
                    <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(100, Math.round((event._count.registrations / event.capacity) * 100))} aria-valuemin={0} aria-valuemax={100} aria-label="Seats filled">
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
                    {event.capacity - event._count.registrations > 0 && event.capacity - event._count.registrations <= 10 && (
                      <p className="text-xs text-[var(--destructive)] mt-1.5 font-medium">
                        Only {event.capacity - event._count.registrations} seats left!
                      </p>
                    )}
                  </div>
                )}

                {/* Registration status */}
                {!canRegister && (
                  <div className="mb-5">
                    {isFull && !event.allowWaitlist && (
                      <Badge variant="destructive">Fully Booked</Badge>
                    )}
                    {isFull && event.allowWaitlist && (
                      <Badge variant="warning">Waitlist Available</Badge>
                    )}
                    {regClosed && !isFull && (
                      <Badge variant="muted">Registration Closed</Badge>
                    )}
                    {regNotOpen && (
                      <Badge variant="muted">Registration Not Yet Open</Badge>
                    )}
                  </div>
                )}

                {/* Form */}
                {canRegister ? (
                  <RegistrationForm
                    eventId={event.id}
                    slug={event.slug}
                    formFields={event.formFields.map((f) => ({
                      id: f.id,
                      label: f.label,
                      helpText: f.helpText,
                      type: f.type,
                      options: f.options,
                      isRequired: f.isRequired,
                    }))}
                    allowWaitlist={event.allowWaitlist}
                    isFull={isFull}
                    requiresApproval={event.requiresApproval}
                    priceIDR={event.priceIDR}
                    paymentInfo={event.paymentInfo}
                    paymentLink={event.paymentLink}
                  />
                ) : isFull && event.allowWaitlist ? (
                  <RegistrationForm
                    eventId={event.id}
                    slug={event.slug}
                    formFields={event.formFields.map((f) => ({
                      id: f.id,
                      label: f.label,
                      helpText: f.helpText,
                      type: f.type,
                      options: f.options,
                      isRequired: f.isRequired,
                    }))}
                    allowWaitlist={event.allowWaitlist}
                    isFull={isFull}
                    requiresApproval={event.requiresApproval}
                    priceIDR={event.priceIDR}
                    paymentInfo={event.paymentInfo}
                    paymentLink={event.paymentLink}
                  />
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Registration is currently unavailable for this event.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Related events */}
          <Suspense fallback={<EventCardSkeleton />}>
            <RelatedEvents currentEventId={event.id} category={event.category as EventCategory} />
          </Suspense>
        </div>

        {/* Sticky mobile CTA */}
        {canRegister && <StickyRegisterBar eventTitle={event.title} priceIDR={event.priceIDR} />}
      </main>

      <PublicFooter />
    </div>
  );
}
