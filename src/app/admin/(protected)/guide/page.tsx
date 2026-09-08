"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    items: [
      {
        heading: "Create Your First Event",
        steps: [
          "Go to **Events** in the sidebar → Click **Create Event**",
          "Fill in **Title** (required), **Slug** (auto-generated, lowercase+hyphens), **Category**, and **Description**",
          "Upload a **Cover Image** — click Upload Image, pick a JPG/PNG/WebP file (max 5MB). Preview shows instantly.",
          "Set **Start** and **End** date/time (all times in Asia/Jakarta / WIB)",
          "Fill **Location** (Venue Name, Address, Map URL) or check **This is an online event** and provide Online URL",
          "Set **Capacity** (leave empty for unlimited) and **Price** (0 = free)",
          "Click **Save as Draft** — event is created but not visible publicly yet",
        ],
      },
      {
        heading: "Publish an Event",
        steps: [
          "After saving as draft, you'll be redirected to the event editor",
          "Review all fields, double-check dates and location",
          "Toggle **Publish** switch or click the **Publish** button at the top",
          "Event is now live and visible at `/events/[slug]`",
        ],
      },
    ],
  },
  {
    id: "managing-events",
    title: "Managing Events",
    icon: "📋",
    items: [
      {
        heading: "Edit an Event",
        steps: [
          "Go to **Events** → click any event card to open the editor",
          "All fields are editable. Changes are saved as drafts automatically",
          "Update **Cover Image** anytime — upload a new image to replace the old one",
          "Use **Custom Registration Fields** to add extra questions (name, phone, allergies, t-shirt size, etc.)",
        ],
      },
      {
        heading: "Event Status Flow",
        steps: [
          "**DRAFT** → Not visible publicly. Safe to edit freely.",
          "**PUBLISHED** → Live on the website. Registrations are open.",
          "**CLOSED** → Event page still visible but no new registrations accepted.",
          "**CANCELLED** → Marked as cancelled. Registrants are notified.",
          "**ARCHIVED** → Hidden from public listings. Data is preserved.",
        ],
      },
      {
        heading: "Delete an Event",
        steps: [
          "Open the event editor → Scroll to the bottom",
          "Click **Delete Event** button",
          "Type `delete` to confirm (safety measure)",
          "️ This is permanent. All registrations and data will be removed.",
        ],
      },
    ],
  },
  {
    id: "registrations",
    title: "Registrations & Check-in",
    icon: "️",
    items: [
      {
        heading: "View Registrations",
        steps: [
          "From the Events list, click the **registrations count** on any event",
          "You'll see a table of all registrants with status (Confirmed, Pending, Waitlisted)",
          "Export data as CSV for offline use",
        ],
      },
      {
        heading: "Check-in Attendees",
        steps: [
          "Go to **Scanner** in the sidebar",
          "Select the event from the dropdown",
          "Scan attendee's QR code (from their ticket email or PDF)",
          "Status updates to **Checked In** instantly",
          "Or use **Live Check-in Feed** for manual check-in by name/email",
        ],
      },
      {
        heading: "Approval Workflow",
        steps: [
          "If event has **Requires Approval** enabled, new registrations go to **Pending** status",
          "Go to the event's registrations page → filter by **Pending**",
          "Click **Approve** or **Reject** for each registration",
          "Approved registrants receive a confirmation email with their ticket",
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
        heading: "Payment Verification",
        steps: [
          "Go to **Payments** in the sidebar",
          "See all registrations with payment status",
          "For events with paid tickets, registrants upload payment proof",
          "Click **Verify** to confirm payment → status changes to **Confirmed**",
          "Click **Reject** if payment is invalid → registrant is notified",
        ],
      },
      {
        heading: "Payment Info Field",
        steps: [
          "When creating/editing an event, fill the **Payment Info** field",
          "This shows bank details, e-wallet info, or payment instructions",
          "Displayed on the registration form so attendees know where to transfer",
        ],
      },
    ],
  },
  {
    id: "promo-codes",
    title: "Promo Codes",
    icon: "️",
    items: [
      {
        heading: "Create a Promo Code",
        steps: [
          "Go to **Promo Codes** in the sidebar → Click **Create Promo Code**",
          "Set **Code** (e.g., HAARMEMBER, EARLYBIRD)",
          "Set **Discount** — either fixed amount (IDR) or percentage (%)",
          "Set **Max Uses** — how many times this code can be used (leave empty for unlimited)",
          "Set **Expiry Date** — code becomes invalid after this date",
          "Click **Save**",
        ],
      },
      {
        heading: "How Promo Codes Work",
        steps: [
          "Registrants enter the code during registration",
          "Discount is applied to the ticket price automatically",
          "Once max uses is reached, code shows as **expired**",
          "Promo codes are per-event — they only work for the assigned event",
        ],
      },
    ],
  },
  {
    id: "users",
    title: "User Management",
    icon: "👤",
    items: [
      {
        heading: "Roles",
        steps: [
          "**Superadmin** — Full access to all admin features",
          "**Organizer** — Can create and manage events, view registrations",
          "**Check-in Staff** — Can only access the Scanner for check-in",
        ],
      },
      {
        heading: "Add a User",
        steps: [
          "Go to **Users** → Click **Create User**",
          "Fill in **Name**, **Email**, and assign a **Role**",
          "Set a temporary **Password** — user can change it after first login",
          "Click **Save**",
        ],
      },
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: "📊",
    items: [
      {
        heading: "Overview Dashboard",
        steps: [
          "Go to **Reports** in the sidebar",
          "See total events, registrations, revenue, and check-in stats",
          "Charts show registration trends over time",
        ],
      },
      {
        heading: "Event-Specific Reports",
        steps: [
          "From the Events list → click the **📊** icon on any event",
          "View registrations, revenue, check-in count for that event",
          "Export full report as CSV",
        ],
      },
    ],
  },
  {
    id: "tips",
    title: "Tips & Best Practices",
    icon: "💡",
    items: [
      {
        heading: "Cover Images",
        steps: [
          "Use **1200×630px** (16:9 ratio) for best display",
          "JPG for photos, PNG for graphics with transparency",
          "Avoid text-heavy images — they don't scale well on mobile",
        ],
      },
      {
        heading: "Event Descriptions",
        steps: [
          "**Markdown is supported** — use `**bold**`, `*italic*`, `## headers`, `- lists`",
          "Include: what the event is about, what to bring, dress code, parking info",
          "Add a map link for offline venues",
        ],
      },
      {
        heading: "Registration Settings",
        steps: [
          "Enable **Allow Waitlist** if you expect overflow registrations",
          "Set **Registration Closes At** to auto-stop accepting sign-ups",
          "Use **Custom Fields** to collect info you need (dietary restrictions, emergency contact, etc.)",
        ],
      },
    ],
  },
];

export default function AdminGuidePage() {
  return (
    <div className="w-full max-w-[900px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Admin Guide
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Everything you need to know about managing HAAJ events.
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
          Need help with something not covered here?
        </p>
        <Link href="/admin">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
