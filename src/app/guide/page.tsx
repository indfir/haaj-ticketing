import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const sections = [
  {
    id: "finding-events",
    title: "Finding Events",
    icon: "🔍",
    items: [
      {
        heading: "Browse All Events",
        steps: [
          "Visit the **Events** page from the navigation menu",
          "All upcoming events are listed with cover image, date, location, and available seats",
          "Click any event card to see full details",
        ],
      },
      {
        heading: "Filter by Category",
        steps: [
          "On the homepage, click category pills: **Observation**, **Workshop**, **Lecture**, **Stargazing**, **Meetup**",
          "Or use the filter on the Events page",
          "Events are also filterable by month",
        ],
      },
    ],
  },
  {
    id: "registering",
    title: "Registering for an Event",
    icon: "",
    items: [
      {
        heading: "How to Register",
        steps: [
          "Open an event page → Click **Register Now**",
          "Fill in your **Full Name**, **Email**, and **Phone Number** (required fields)",
          "Some events may have additional fields (e.g., member number, dietary restrictions)",
          "If the event has a fee, follow the **Payment Instructions** shown on screen",
          "Click **Submit Registration**",
        ],
      },
      {
        heading: "Registration Status",
        steps: [
          "**Confirmed** — You're in! A confirmation email with your ticket will be sent.",
          "**Pending Payment** — Transfer the fee and upload payment proof. Your spot is reserved temporarily.",
          "**Pending Approval** — The organizer will review your registration. You'll be notified via email.",
          "**Waitlisted** — Event is full. You'll be notified if a spot opens up.",
        ],
      },
      {
        heading: "Promo Codes",
        steps: [
          "If you have a promo code, enter it in the **Promo Code** field during registration",
          "Discount is applied instantly to the ticket price",
          "Each code can only be used once per registration",
        ],
      },
    ],
  },
  {
    id: "tickets",
    title: "Your Ticket",
    icon: "️",
    items: [
      {
        heading: "Receiving Your Ticket",
        steps: [
          "After confirmed registration, you'll receive an email with your **digital ticket**",
          "The ticket contains a **QR code** — this is your entry pass",
          "You can also download your ticket as **PDF** or **PNG**",
        ],
      },
      {
        heading: "Find My Ticket",
        steps: [
          "Lost your email? Go to **Find Ticket** from the navigation menu",
          "Enter the **email address** you used during registration",
          "Your ticket will be displayed — download or screenshot it",
          "Bring it to the event venue for check-in",
        ],
      },
      {
        heading: "At the Venue",
        steps: [
          "Show your **QR code** (on phone or printed) to the check-in staff",
          "Staff will scan it and confirm your registration",
          "No need to print — phone screen is fine",
        ],
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: "💰",
    items: [
      {
        heading: "How to Pay",
        steps: [
          "After registering for a paid event, you'll see **Payment Instructions**",
          "This includes bank account details or e-wallet information",
          "Transfer the exact amount shown",
          "Upload your **Payment Proof** (screenshot of transfer receipt) in the registration form",
        ],
      },
      {
        heading: "Payment Verification",
        steps: [
          "After uploading proof, status changes to **Pending Payment**",
          "The organizer will verify your payment within 1-3 business days",
          "Once verified, you'll receive a **confirmation email** with your ticket",
          "If payment is rejected (wrong amount, invalid proof), you'll be notified to re-submit",
        ],
      },
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation & Refunds",
    icon: "↩️",
    items: [
      {
        heading: "Event Cancelled by Organizer",
        steps: [
          "If an event is cancelled, all registrants are notified via email",
          "For paid events, refunds are processed within 7-14 business days",
          "The refund method matches the original payment method",
        ],
      },
      {
        heading: "Cancelling Your Registration",
        steps: [
          "Contact the event organizer via the **Contact** information on the event page",
          "Free events: cancellation is usually immediate",
          "Paid events: refund policy depends on how close to the event date",
        ],
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    icon: "❓",
    items: [
      {
        heading: "Is registration free?",
        steps: [
          "Many HAAJ events are **free** (marked with a green **Free** badge).",
          "Some special events (workshops, trips) may have a fee to cover costs.",
          "The price is always shown clearly on the event page.",
        ],
      },
      {
        heading: "Do I need to be a HAAJ member?",
        steps: [
          "Most events are open to the **general public**.",
          "Some events are marked **Members Only** — these require a HAAJ membership number.",
          "Contact HAAJ if you'd like to become a member.",
        ],
      },
      {
        heading: "Can I bring a friend?",
        steps: [
          "Each person must **register individually** — tickets are non-transferable.",
          "If capacity allows, just have your friend register separately.",
          "If the event is full, they can join the waitlist.",
        ],
      },
      {
        heading: "What should I bring to an observation event?",
        steps: [
          "Check the event description for specific instructions.",
          "Generally: warm clothes (observations are at night), flashlight (red light preferred), notebook, and curiosity!",
          "Telescopes are usually provided, but you can bring your own.",
        ],
      },
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 sm:py-14">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-4xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Guide & Help
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Everything you need to know about attending HAAJ events.
            </p>
          </div>

          {/* Quick nav */}
          <nav className="mb-8 p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-3 font-medium">
              Jump to section
            </p>
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors"
                >
                  <span>{s.icon}</span>
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="text-xl sm:text-2xl mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  <span>{section.icon}</span>
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
                      <h3 className="text-base font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                        {item.heading}
                      </h3>
                      <ol className="space-y-2">
                        {item.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="flex gap-3 text-sm text-[var(--foreground)]">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] text-xs font-medium flex items-center justify-center mt-0.5">
                              {stepIdx + 1}
                            </span>
                            <span
                              className="leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: step
                                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--muted)] text-xs font-mono">$1</code>'),
                              }}
                            />
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <Separator className="my-10" />

          <div className="text-center py-6">
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Still have questions? Visit our{" "}
              <Link href="/contact" className="text-[var(--accent)] hover:underline">
                Contact page
              </Link>{" "}
              to reach out.
            </p>
            <Link href="/events" className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] px-5 text-sm font-medium text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--muted)]">
              Browse Events →
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
