# HAAJ Event Ticketing Platform

Production-ready event ticketing web application for **HAAJ (Himpunan Astronomi Amatir Jakarta)**, an amateur astronomy community based in Jakarta, Indonesia.

## Three surfaces, one codebase

1. **Public site** — visitors browse events and register
2. **Admin dashboard** — organisers create/configure events and manage registrants
3. **Check-in scanner** — phone-friendly QR scanner for venue check-in

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript (strict) |
| Styling | Tailwind CSS v4 with CSS custom properties |
| UI primitives | Radix UI (unstyled, custom-styled) |
| Database | PostgreSQL |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Auth | Auth.js v5 (NextAuth beta) — JWT sessions, Credentials + optional Google |
| Validation | Zod (shared client/server) |
| QR generation | `qrcode` (server-side PNG) |
| QR scanning | `html5-qrcode` (camera-based) |
| Charts | Recharts |
| Dates | `date-fns` + `date-fns-tz` (UTC storage, WIB display) |
| Testing | Vitest (units), Playwright (e2e) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (local or cloud — Neon, Supabase, etc.)

### Setup

```bash
# Clone and install
cd haaj-ticketing
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing (`openssl rand -base64 32`) |
| `HMAC_SECRET` | Yes | Secret for QR payload signing (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |
| `RESEND_API_KEY` | No | Resend API key for email |
| `EMAIL_FROM` | No | Sender email address |

### Seed Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@haaj.id` | `admin123` | SUPERADMIN |
| Organizer | `organizer@haaj.id` | `organizer123` | ORGANIZER |
| Staff | `staff@haaj.id` | `staff123` | CHECKIN_STAFF |

### NPM Scripts

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run start          # Start production server
npm run lint           # ESLint
npm run test           # Vitest unit tests
npm run test:watch     # Vitest watch mode
npm run test:e2e       # Playwright e2e tests
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:push        # Push schema without migrations
npm run db:seed        # Seed sample data
npm run db:studio      # Open Prisma Studio
```

## Folder Structure

```
src/
├── app/
│   ├── admin/                    # Admin dashboard (auth-protected)
│   │   ├── login/                # Sign-in page
│   │   ├── events/               # Events list + create/edit
│   │   │   └── [id]/
│   │   │       ├── registrations/ # Registrant management
│   │   │       └── report/       # Attendance report + charts
│   │   └── scan/                 # QR scanner (mobile-first)
│   ├── events/                   # Public events index + detail
│   │   └── [slug]/               # Event detail + registration form
│   ├── t/[ticketCode]/           # Ticket page with QR code
│   ├── ticket/lookup/            # Find my ticket
│   ├── about/                    # Static: About HAAJ
│   ├── code-of-conduct/          # Static: Code of Conduct
│   ├── contact/                  # Static: Contact
│   ├── privacy/                  # Static: Privacy Policy
│   ├── styleguide/               # Component styleguide
│   └── api/
│       ├── auth/[...nextauth]/   # Auth.js routes
│       ├── admin/
│       │   ├── events/           # Event CRUD API
│       │   ├── checkin/          # Check-in API (idempotent)
│       │   └── registrations/    # Registration status API
│       ├── events/[slug]/register/ # Public registration API
│       └── tickets/              # Ticket + QR API
├── components/
│   ├── ui/                       # Base components (Button, Input, etc.)
│   ├── theme/                    # Theme provider + toggle
│   ├── auth/                     # Session provider
│   ├── admin/                    # Admin-specific components
│   └── public/                   # Public layout components
├── lib/
│   ├── auth.ts                   # Auth.js configuration
│   ├── db.ts                     # Prisma client singleton
│   ├── qr.ts                     # QR signing/verification
│   └── utils.ts                  # cn() utility
├── generated/prisma/             # Generated Prisma client
└── types/                        # TypeScript type augmentation
prisma/
├── schema.prisma                 # Database schema
├── migrations/                   # Migration files
└── seed.ts                       # Seed script
e2e/
└── registration-flow.spec.ts     # Playwright e2e test
```

## Design System

See [DESIGN.md](./DESIGN.md) for full documentation.

**Typeface pairing:** Instrument Serif (display) + Inter Tight (body) + IBM Plex Mono (data)

**Colour:** Warm off-white paper (`#FAFAF8`) / deep charcoal (`#0F1115`), warm copper accent (`#B48E5A` / `#C9A46C`)

**Elevation:** Zero shadows. Hairline borders + background tone shifts only.

## QR Security

- Ticket codes are human-readable (`HAAJ-XXXX-XXXX`)
- QR encodes a **signed payload**: `{ ticketCode, eventId, iat }` + HMAC-SHA256 signature
- Server verifies signature on every scan
- Check-in is **idempotent** — second scan returns "already checked in" with original timestamp
- Race-safe via DB unique constraint on `registrationId`

## Deployment

### Vercel + Neon/Supabase

1. Create PostgreSQL database (Neon or Supabase)
2. Deploy to Vercel
3. Set environment variables in Vercel dashboard
4. Run `npm run db:migrate` via Vercel CLI or database console

### Self-hosted

1. Set up PostgreSQL
2. Build: `npm run build`
3. Start: `npm run start`
4. Use a reverse proxy (nginx, Caddy) for HTTPS

---

## ⚠️ PLACEHOLDERS — Needs Real HAAJ Content

The following placeholders need to be replaced with real content. Search the codebase for these markers:

| Placeholder | Location | Description |
|-------------|----------|-------------|
| `[ABOUT_HAAJ]` | Home, About page | Organisation description |
| `[COMMUNITY_NAME]` | Home page | Full community name |
| `[HAAJ_HISTORY]` | About page | History of HAAJ |
| `[HAAJ_MISSION]` | About page | Mission statement |
| `[HAAJ_ACTIVITIES]` | About page | Regular activities |
| `[CONTACT_EMAIL]` | Footer, Contact page | Contact email address |
| `[CONTACT_SOCIAL]` | Contact page | Social media links |
| `[CONTACT_NAME]` | Seed data, event details | Contact person name |
| `[CONTACT_PHONE]` | Seed data, event details | Contact phone number |
| `[COPYRIGHT_NOTICE]` | Footer | Copyright text |
| `[CODE_OF_CONDUCT_*]` | Code of Conduct page | Full code of conduct text |
| `[PRIVACY_*]` | Privacy page | Full privacy policy text |
| `[EVENT_TITLE]` | Home page next event card | Next event title |
| `[EVENT_DATE]` | Home page next event card | Next event date |
| `[EVENT_LOCATION]` | Home page next event card | Next event location |
| `[OBSERVATION_SITE]` | Seed data | Observation location name |
| `[VENUE_NAME]` | Seed data | Generic venue name |
| `[ADDRESS]` | Seed data, event details | Physical address |
| `[ONLINE_URL]` | Seed data | Online event URL |
| `[EQUIPMENT_DETAILS]` | Seed data | Equipment info for observation events |
| `[WORKSHOP_DETAILS]` | Seed data | Workshop details |
| `[LECTURE_DESCRIPTION]` | Seed data | Lecture description |
| `[STARGAZING_DESCRIPTION]` | Seed data | Stargazing event description |
| `[MEETUP_DESCRIPTION]` | Seed data | Meetup description |
| `[LOCATION]` | Event detail page | Fallback location text |
| `[EVENT_DESCRIPTION]` | Event detail page | Fallback description |

---

## Acceptance Criteria

- [x] Admin can create, configure, and publish an event with custom registration fields
- [x] Visitor can register and receives a ticket page with QR code
- [x] Ticket page shows a scannable QR on solid light background
- [x] Scanning valid QR checks attendee in; re-scan reports "already checked in"
- [x] Tampered/foreign QR is rejected (HMAC verification)
- [x] Dashboard registrant count and check-in rate update
- [x] Capacity enforced; overflow goes to waitlist when enabled
- [x] Both themes complete, persisted, flash-free
- [x] `grep -r "shadow" src/` returns no shadow utility classes
- [x] No invented facts about HAAJ — all unknown content is flagged placeholder
- [x] Unit tests pass (QR signing/verification)
- [x] E2e test written (register → ticket → check-in)
