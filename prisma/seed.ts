import { PrismaClient } from "../src/generated/prisma/client";
import { EventCategory, EventStatus, RegistrationStatus, UserRole } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

function randomTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `HAAJ-${seg(4)}-${seg(4)}`;
}

async function main() {
  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.eventFormField.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ─── Admin user ───
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Admin HAAJ",
      email: "admin@haaj.id",
      passwordHash: adminPassword,
      role: UserRole.SUPERADMIN,
      isActive: true,
    },
  });

  const organizerPassword = await bcrypt.hash("organizer123", 12);
  const organizer = await prisma.user.create({
    data: {
      name: "Event Organizer",
      email: "organizer@haaj.id",
      passwordHash: organizerPassword,
      role: UserRole.ORGANIZER,
      isActive: true,
    },
  });

  const staffPassword = await bcrypt.hash("staff123", 12);
  const staff = await prisma.user.create({
    data: {
      name: "Check-in Staff",
      email: "staff@haaj.id",
      passwordHash: staffPassword,
      role: UserRole.CHECKIN_STAFF,
      isActive: true,
    },
  });

  // ─── 10 Astronomical Events (after 27 August 2026) ───
  const wib = "Asia/Jakarta";

  const events = await Promise.all([
    // 1. Gerhana Bulan Sebagian — 28 Agustus 2026
    prisma.event.create({
      data: {
        slug: "gerhana-bulan-sebagian-agustus-2026",
        title: "Partial Lunar Eclipse",
        subtitle: "Partial Lunar Eclipse — August 2026",
        description:
          `Witness the partial lunar eclipse phenomenon on August 28, 2026! The Moon will enter part of Earth's umbra shadow, creating a dramatic sight in the Jakarta night sky.

This event will be held at the open area of Ancol Beach with a wide sky view and minimal light pollution. We provide refractor and reflector telescopes for detailed observation of the Moon's surface during the eclipse phases.

Agenda:
• 19:00 WIB — Registration & welcome drink
• 19:30 WIB — Brief introduction to lunar eclipse mechanics
• 20:15 WIB — Penumbra phase observation
• 21:00 WIB — Peak of partial eclipse (telescope observation)
• 22:30 WIB — Photo session & discussion

Equipment provided by HAAJ. Participants are advised to bring a mat/sitting pad and jacket.`,
        coverImageUrl: "/uploads/covers/partial-lunar-eclipse.svg",
        category: EventCategory.OBSERVATION,
        status: EventStatus.PUBLISHED,
        startAt: new Date("2026-08-28T12:00:00Z"),
        endAt: new Date("2026-08-28T16:00:00Z"),
        timezone: wib,
        locationName: "Pantai Festival Ancol",
        locationAddress: "Jl. Lodan Timur No.7, Ancol, Pademangan, Jakarta Utara, DKI Jakarta 14430",
        locationMapUrl: "https://maps.app.goo.gl/ancol",
        latitude: -6.1250,
        longitude: 106.8310,
        capacity: 60,
        allowWaitlist: true,
        registrationOpensAt: new Date("2026-08-01T00:00:00Z"),
        registrationClosesAt: new Date("2026-08-27T23:59:59Z"),
        requiresApproval: false,
        priceIDR: 0,
        contactPerson: "Raka Aditya",
        contactPhone: "+6281234567890",
        createdById: admin.id,
      },
    }),

    // 2. Oposisi Saturnus — 2 September 2026
    prisma.event.create({
      data: {
        slug: "oposisi-saturnus-september-2026",
        title: "Saturn Opposition 2026",
        subtitle: "Saturn at its closest & brightest position this year",
        description:
          `Saturn will be at opposition on September 2, 2026 — meaning the planet is directly opposite the Sun as viewed from Earth. This is the best time to observe Saturn along with its iconic rings!

Observation is held in the Puncak area, Bogor at an altitude of 1,200 masl with low light pollution. HAAJ provides several large-diameter telescopes to view details of Saturn's rings, the Cassini Division, and its moons including Titan.

Agenda:
• 18:00 WIB — Gather & register at meeting point
• 18:30 WIB — Presentation: "Getting to Know Saturn & Its Ring System"
• 19:30 WIB — Saturn observation (8" & 10" telescopes)
• 21:00 WIB — Afocal astrophotography session (smartphones welcome)
• 22:00 WIB — Deep-sky tour: Nebulae & spring star clusters
• 23:00 WIB — Closing & group photo

Transportation from Jakarta is not provided. Private vehicles are recommended.`,
        coverImageUrl: "/uploads/covers/saturn-opposition.svg",
        category: EventCategory.OBSERVATION,
        status: EventStatus.PUBLISHED,
        startAt: new Date("2026-09-02T11:00:00Z"),
        endAt: new Date("2026-09-02T16:00:00Z"),
        timezone: wib,
        locationName: "Taman Wisata Riung Gunung, Puncak",
        locationAddress: "Jl. Raya Puncak KM 87, Cisarua, Bogor, Jawa Barat 16750",
        locationMapUrl: "https://maps.app.goo.gl/riunggunung",
        latitude: -6.6994,
        longitude: 106.9311,
        capacity: 40,
        allowWaitlist: true,
        registrationOpensAt: new Date("2026-08-10T00:00:00Z"),
        registrationClosesAt: new Date("2026-08-31T23:59:59Z"),
        requiresApproval: false,
        priceIDR: 50000,
        paymentInfo: "Transfer to BCA 1234567890 a.n. HAAJ Indonesia. Include proof of transfer during registration.",
        contactPerson: "Dimas Prasetyo",
        contactPhone: "+6282198765432",
        createdById: organizer.id,
      },
    }),

    // 3. Supermoon — 28 September 2026
    prisma.event.create({
      data: {
        slug: "supermoon-september-2026",
        title: "Supermoon September 2026",
        subtitle: "Perigee Full Moon — appears 14% larger",
        description:
          `The full moon on September 28, 2026 coincides with the perigee position (the Moon's closest point to Earth), making it a supermoon! The Moon will appear about 14% larger and 30% brighter than a regular full moon.

The observation location is at the Jakarta Planetarium, Taman Ismail Marzuki — one of the oldest astronomy centers in Indonesia. This event is suitable for families and beginners who want to learn about astronomy.

Agenda:
• 17:00 WIB — Open gate & short Planetarium tour
• 17:30 WIB — Mini lecture: "What is a Supermoon?"
• 18:15 WIB — Planetarium show (30 minutes)
• 19:00 WIB — Moonrise observation from the rooftop
• 19:30 WIB — Detailed Moon surface observation with telescopes
• 20:30 WIB — Q&A session & closing

Suitable for all ages! Children under 12 must be accompanied by a parent.`,
        coverImageUrl: "/uploads/covers/supermoon.svg",
        category: EventCategory.OBSERVATION,
        status: EventStatus.PUBLISHED,
        startAt: new Date("2026-09-28T10:00:00Z"),
        endAt: new Date("2026-09-28T13:30:00Z"),
        timezone: wib,
        locationName: "Planetarium Jakarta — Taman Ismail Marzuki",
        locationAddress: "Jl. Cikini Raya No.73, Cikini, Menteng, Jakarta Pusat, DKI Jakarta 10330",
        locationMapUrl: "https://maps.app.goo.gl/planetariumjkt",
        latitude: -6.1872,
        longitude: 106.8383,
        capacity: 80,
        allowWaitlist: true,
        registrationOpensAt: new Date("2026-09-01T00:00:00Z"),
        registrationClosesAt: new Date("2026-09-26T23:59:59Z"),
        requiresApproval: false,
        priceIDR: 25000,
        paymentInfo: "Includes Planetarium entry ticket. Transfer to BCA 1234567890 a.n. HAAJ Indonesia.",
        contactPerson: "Anisa Nurul",
        contactPhone: "+6285678901234",
        createdById: admin.id,
      },
    }),

    // 4. Hujan Meteor Orionid — 21-22 Oktober 2026
    prisma.event.create({
      data: {
        slug: "hujan-meteor-orionid-oktober-2026",
        title: "Orionid Meteor Shower 2026",
        subtitle: "Peak of the meteor shower from Comet Halley's debris",
        description:
          `The Orionid meteor shower is one of the most anticipated meteor showers every year, originating from the debris of the legendary Comet 1P/Halley. Its peak is predicted on the night of October 21-22, 2026 with an intensity of up to 20-25 meteors per hour.

Observation is held in the Mount Halimun Salak National Park area, a very dark location ideal for meteor observation. We provide camping areas, communal tents, and observation equipment.

Agenda:
• 16:00 WIB — Registration & tent setup
• 17:30 WIB — Group dinner
• 18:30 WIB — Safety briefing & constellation introduction
• 20:00 WIB — Observation begins (first shooting stars!)
• 00:00 WIB — Peak observation — Orion radiant above the horizon
• 03:00 WIB — Golden hour for meteors (highest radiant point)
• 05:00 WIB — Sunrise & closing

Includes: dinner, breakfast, communal tent, sleeping mat. Bring your own sleeping bag.`,
        coverImageUrl: "/uploads/covers/orionid-meteor.svg",
        category: EventCategory.STARGAZING,
        status: EventStatus.PUBLISHED,
        startAt: new Date("2026-10-21T09:00:00Z"),
        endAt: new Date("2026-10-21T22:00:00Z"),
        timezone: wib,
        locationName: "Taman Nasional Gunung Halimun Salak — Pos Citalahab",
        locationAddress: "Citalahab, Malasari, Nanggung, Bogor, Jawa Barat 16650",
        locationMapUrl: "https://maps.app.goo.gl/halimun",
        latitude: -6.7380,
        longitude: 106.5520,
        capacity: 35,
        allowWaitlist: true,
        registrationOpensAt: new Date("2026-09-15T00:00:00Z"),
        registrationClosesAt: new Date("2026-10-18T23:59:59Z"),
        requiresApproval: true,
        priceIDR: 150000,
        paymentInfo: "Includes dinner, breakfast, communal tent, and sleeping mat. Transfer to BCA 1234567890 a.n. HAAJ Indonesia.",
        contactPerson: "Fajar Ramadhan",
        contactPhone: "+6281345678901",
        createdById: organizer.id,
      },
    }),

    // 5. Workshop Astrofotografi — 8 November 2026
    prisma.event.create({
      data: {
        slug: "workshop-astrofotografi-november-2026",
        title: "Astrophotography Workshop for Beginners",
        subtitle: "From smartphone to DSLR — capture the beauty of the night sky",
        description:
          `Ever wanted to photograph the Milky Way, star trails, or planets with your own camera? This workshop is designed specifically for beginners who want to start their astrophotography journey.

Located at the PUSPIPTEK Science Center in Serpong, which has a spacious outdoor area and indoor facilities for theory sessions. Topics include camera settings for astrophotography, long exposure techniques, stacking, and post-processing.

Topics:
• Introduction to astrophotography: widefield, planetary, deep-sky
• DSLR/mirrorless camera settings for the night sky
• Smartphone astrophotography techniques (just need a phone!)
• Composition & foreground interest
• Hands-on: night sky photography in the outdoor area
• Basic post-processing with free software (GIMP/Sequator)

Participants must bring:
- DSLR/mirrorless camera OR smartphone with manual/pro mode
- Tripod (mandatory)
- Laptop for editing session (optional)

Instructor: Bimo — experienced astrophotographer, NASA APOD contributor.`,
        coverImageUrl: "/uploads/covers/astrophotography-workshop.svg",
        category: EventCategory.WORKSHOP,
        status: EventStatus.PUBLISHED,
        startAt: new Date("2026-11-08T10:00:00Z"),
        endAt: new Date("2026-11-08T16:00:00Z"),
        timezone: wib,
        locationName: "Pusat Sains & Teknologi (PUSPIPTEK) Serpong",
        locationAddress: "Kawasan PUSPIPTEK, Setu, Tangerang Selatan, Banten 15314",
        locationMapUrl: "https://maps.app.goo.gl/puspiptek",
        latitude: -6.3588,
        longitude: 106.6653,
        capacity: 25,
        allowWaitlist: false,
        registrationOpensAt: new Date("2026-10-01T00:00:00Z"),
        registrationClosesAt: new Date("2026-11-05T23:59:59Z"),
        requiresApproval: true,
        priceIDR: 100000,
        paymentInfo: "Includes digital materials, certificate, and snacks. Transfer to BCA 1234567890 a.n. HAAJ Indonesia.",
        contactPerson: "Kartika Putri",
        contactPhone: "+6287654321098",
        createdById: organizer.id,
      },
    }),

    // 6. Hujan Meteor Leonid — 17-18 November 2026
    prisma.event.create({
      data: {
        slug: "hujan-meteor-leonid-november-2026",
        title: "Leonid Meteor Shower 2026",
        subtitle: "Fast meteors from constellation Leo — up to 15 meteors/hour",
        description:
          `The Leonid meteor shower originates from the debris of Comet 55P/Tempel-Tuttle and is known for its extremely fast meteors — reaching 71 km/second! The Leonid 2026 peak is predicted on the night of November 17-18.

Observation will be held at Kampung Langit Sukabumi, an astro-tourism destination famous for its dark skies (Bortle Scale 3-4). The location is at an altitude of 800 masl with an open horizon facing east.

Agenda:
• 17:00 WIB — Registration & camp check-in
• 18:00 WIB — Sundanese dinner
• 19:00 WIB — Short lecture: "Comets & Meteor Showers"
• 20:00 WIB — Stargazing & constellation identification
• 23:00 WIB — Intensive meteor observation begins
• 02:00 WIB — Leonid peak (Leo constellation above horizon)
• 04:30 WIB — Morning Saturn & Mars planet observation
• 05:30 WIB — Sunrise & breakfast

Includes: camping, dinner & breakfast, observation equipment.`,
        coverImageUrl: "/uploads/covers/leonid-meteor.svg",
        category: EventCategory.STARGAZING,
        status: EventStatus.PUBLISHED,
        startAt: new Date("2026-11-17T10:00:00Z"),
        endAt: new Date("2026-11-17T22:30:00Z"),
        timezone: wib,
        locationName: "Kampung Langit, Sukabumi",
        locationAddress: "Desa Cimaja, Kec. Cikakak, Kabupaten Sukabumi, Jawa Barat 43155",
        locationMapUrl: "https://maps.app.goo.gl/kampunglangit",
        latitude: -6.9700,
        longitude: 106.4500,
        capacity: 30,
        allowWaitlist: true,
        registrationOpensAt: new Date("2026-10-15T00:00:00Z"),
        registrationClosesAt: new Date("2026-11-14T23:59:59Z"),
        requiresApproval: true,
        priceIDR: 175000,
        paymentInfo: "Includes camping, Sundanese dinner, breakfast, and equipment. Transfer to BCA 1234567890 a.n. HAAJ Indonesia.",
        contactPerson: "Reza Fahlevi",
        contactPhone: "+6281987654321",
        createdById: admin.id,
      },
    }),

    // 7. Oposisi Jupiter — 12 Desember 2026
    prisma.event.create({
      data: {
        slug: "oposisi-jupiter-desember-2026",
        title: "Jupiter Opposition 2026",
        subtitle: "The king of planets at its closest — observe the Great Red Spot!",
        description:
          `Jupiter will be at opposition on December 12, 2026 — the best time to observe the largest planet in our solar system! At this moment, Jupiter appears at its biggest and brightest throughout the year.

With telescopes, we can see details of Jupiter's atmosphere: cloud bands, the Great Red Spot, and the four Galilean moons — Io, Europa, Ganymede, and Callisto.

The observation is held at the Bogor Botanical Gardens, which provides an open area with a good view of the northern sky and a peaceful atmosphere at night.

Agenda:
• 18:00 WIB — Open gate & registration at Taman Astrid
• 18:30 WIB — Presentation: "Jupiter — The King of Planets"
• 19:15 WIB — Jupiter rise! Observation begins
• 20:00 WIB — Jupiter rotation: observe changing atmospheric details
• 21:00 WIB — Planetary astrophotography session
• 22:00 WIB — Bonus: winter deep-sky objects (Orion Nebula, Pleiades)
• 22:30 WIB — Closing

Equipment: 10" Dobsonian telescope, 8" SCT, and 15x70 binoculars.`,
        coverImageUrl: "/uploads/covers/jupiter-observation.svg",
        category: EventCategory.OBSERVATION,
        status: EventStatus.PUBLISHED,
        startAt: new Date("2026-12-12T11:00:00Z"),
        endAt: new Date("2026-12-12T15:30:00Z"),
        timezone: wib,
        locationName: "Kebun Raya Bogor — Taman Astrid",
        locationAddress: "Jl. Ir. H. Juanda No.13, Paledang, Kec. Bogor Tengah, Kota Bogor, Jawa Barat 16122",
        locationMapUrl: "https://maps.app.goo.gl/kebunrayabogor",
        latitude: -6.5971,
        longitude: 106.7990,
        capacity: 50,
        allowWaitlist: true,
        registrationOpensAt: new Date("2026-11-15T00:00:00Z"),
        registrationClosesAt: new Date("2026-12-10T23:59:59Z"),
        requiresApproval: false,
        priceIDR: 35000,
        paymentInfo: "Includes Bogor Botanical Gardens night entry ticket. Transfer to BCA 1234567890 a.n. HAAJ Indonesia.",
        contactPerson: "Hendra Wijaya",
        contactPhone: "+6282345678901",
        createdById: admin.id,
      },
    }),

    // 8. Hujan Meteor Geminid — 13-14 Desember 2026
    prisma.event.create({
      data: {
        slug: "hujan-meteor-geminid-desember-2026",
        title: "Geminid Meteor Shower 2026",
        subtitle: "The king of meteor showers — up to 150 meteors per hour!",
        description:
          `The Geminid is the strongest and most consistent meteor shower throughout the year! With an intensity of up to 120-150 meteors per hour at its peak (December 13-14), the Geminid produces colorful meteors: white, yellow, green, red, and blue.

Unlike other meteor showers, the Geminid does not originate from a comet but from the asteroid 3200 Phaethon — making it unique among major meteor showers.

This observation event is held at Carita Beach, Banten — a coastal location with an open horizon and minimal light pollution. Overnight observation with camping facilities on the beach.

Agenda:
• 15:00 WIB — Registration & camp setup on the beach
• 17:00 WIB — Sunset watching & briefing
• 18:00 WIB — BBQ dinner on the beach
• 19:30 WIB — Introduction to winter constellations (Orion, Gemini, Taurus)
• 21:00 WIB — Geminid watching begins!
• 00:00 WIB — Peak intensity (Gemini constellation at zenith)
• 03:00 WIB — Late night session for the hardy stargazers
• 05:30 WIB — Sunrise & beach breakfast
• 07:00 WIB — Pack up & head home

Includes: camping, BBQ dinner, breakfast, observation equipment.`,
        coverImageUrl: "/uploads/covers/geminid-meteor.svg",
        category: EventCategory.STARGAZING,
        status: EventStatus.PUBLISHED,
        startAt: new Date("2026-12-13T08:00:00Z"),
        endAt: new Date("2026-12-14T00:00:00Z"),
        timezone: wib,
        locationName: "Pantai Carita, Banten",
        locationAddress: "Jl. Raya Carita, Sukanegara, Carita, Pandeglang, Banten 42264",
        locationMapUrl: "https://maps.app.goo.gl/pantaicarita",
        latitude: -6.3340,
        longitude: 105.8370,
        capacity: 45,
        allowWaitlist: true,
        registrationOpensAt: new Date("2026-11-01T00:00:00Z"),
        registrationClosesAt: new Date("2026-12-10T23:59:59Z"),
        requiresApproval: true,
        priceIDR: 200000,
        paymentInfo: "Includes camping, BBQ dinner, breakfast, and equipment. Transfer to BCA 1234567890 a.n. HAAJ Indonesia.",
        contactPerson: "Putri Handayani",
        contactPhone: "+6885432109876",
        createdById: organizer.id,
      },
    }),

    // 9. Konjungsi Venus-Saturnus — 22 Januari 2027
    prisma.event.create({
      data: {
        slug: "konjungsi-venus-saturnus-januari-2027",
        title: "Venus-Saturn Conjunction",
        subtitle: "Two planets close together in the twilight sky",
        description:
          `On January 22, 2027, Venus and Saturn will appear very close together in the western sky at twilight — a beautiful conjunction! Both planets will be less than 1 degree apart, observable with the naked eye and in more detail with a telescope.

Venus, as the brightest object in the sky (after the Sun and Moon), will serve as a directional guide, and Saturn with its rings can be observed right next to it. A rare moment that only happens once every few years!

The observation location is at Ragunan, South Jakarta — an open area with a good view of the western sky for observing twilight objects.

Agenda:
• 16:30 WIB — Registration & telescope setup
• 17:00 WIB — Mini lecture: "Understanding Planetary Conjunctions"
• 17:30 WIB — Sunset watching
• 17:50 WIB — Venus appears! Observation begins
• 18:10 WIB — Venus-Saturn conjunction through the telescope
• 18:45 WIB — Twilight astrophotography (Venus-Saturn with city foreground)
• 19:15 WIB — Closing

Short and free event — perfect for after work/classes!`,
        coverImageUrl: "/uploads/covers/venus-saturn-conjunction.svg",
        category: EventCategory.OBSERVATION,
        status: EventStatus.DRAFT,
        startAt: new Date("2027-01-22T09:30:00Z"),
        endAt: new Date("2027-01-22T12:15:00Z"),
        timezone: wib,
        locationName: "Taman Margasatwa Ragunan — Lapangan Utama",
        locationAddress: "Jl. Harsono RM No.1, Ragunan, Ps. Minggu, Jakarta Selatan, DKI Jakarta 12550",
        locationMapUrl: "https://maps.app.goo.gl/ragunan",
        latitude: -6.3102,
        longitude: 106.8200,
        capacity: 70,
        allowWaitlist: false,
        registrationOpensAt: new Date("2027-01-01T00:00:00Z"),
        registrationClosesAt: new Date("2027-01-20T23:59:59Z"),
        requiresApproval: false,
        priceIDR: 0,
        contactPerson: "Maya Anggraini",
        contactPhone: "+6281122334455",
        createdById: admin.id,
      },
    }),

    // 10. Pengamatan Mars — 6 Februari 2027
    prisma.event.create({
      data: {
        slug: "pengamatan-mars-februari-2027",
        title: "Mars Observation: The Red Planet in the Night Sky",
        subtitle: "Mars approaches opposition — surface details visible!",
        description:
          `Mars will approach opposition in early 2027, and on February 6 the red planet will be close enough to observe its surface details: polar ice cap, the dark plain of Syrtis Major, and thin cloud formations in the Martian atmosphere.

The observation is held at Bosscha Observatory, Lembang — the oldest professional observatory in Indonesia, operating since 1923. Participants will get a rare opportunity to use the historic Zeiss refractor telescope to observe Mars.

Agenda:
• 17:00 WIB — Registration at Bosscha Observatory gate
• 17:30 WIB — Observatory tour & history of Indonesian astronomy
• 18:30 WIB — Public lecture: "Mars — From Mythology to Space Missions"
• 19:30 WIB — Mars observation with the Zeiss refractor telescope
• 20:30 WIB — Mars rotation: observe changing surface features
• 21:30 WIB — Deep-sky tour: Orion Nebula, Pleiades Cluster, Andromeda
• 22:00 WIB — Discussion & closing

Limited quota due to observatory capacity. Travel from Jakarta takes about 3 hours via the Cipularang toll road.`,
        coverImageUrl: "/uploads/covers/mars-observation.svg",
        category: EventCategory.OBSERVATION,
        status: EventStatus.DRAFT,
        startAt: new Date("2027-02-06T10:00:00Z"),
        endAt: new Date("2027-02-06T15:00:00Z"),
        timezone: wib,
        locationName: "Observatorium Bosscha, Lembang",
        locationAddress: "Jl. Peneropongan Bintang, Lembang, Kab. Bandung Barat, Jawa Barat 40391",
        locationMapUrl: "https://maps.app.goo.gl/bosscha",
        latitude: -6.8246,
        longitude: 107.6170,
        capacity: 30,
        allowWaitlist: true,
        registrationOpensAt: new Date("2027-01-10T00:00:00Z"),
        registrationClosesAt: new Date("2027-02-03T23:59:59Z"),
        requiresApproval: true,
        isMembersOnly: true,
        priceIDR: 75000,
        paymentInfo: "Includes Bosscha Observatory entry ticket & telescope maintenance donation. Transfer to BCA 1234567890 a.n. HAAJ Indonesia.",
        contactPerson: "Prof. Irfan Hakim",
        contactPhone: "+6281567890123",
        createdById: organizer.id,
      },
    }),
  ]);

  // ─── Custom form fields for workshop astrofotografi ───
  const workshopEvent = events[4]; // Workshop Astrofotografi
  await prisma.eventFormField.createMany({
    data: [
      {
        eventId: workshopEvent.id,
        label: "Type of camera owned",
        type: "SELECT",
        options: { values: ["Smartphone only", "DSLR", "Mirrorless", "Action cam", "Don't have one yet"] },
        isRequired: true,
        sortOrder: 0,
      },
      {
        eventId: workshopEvent.id,
        label: "Do you own a tripod?",
        type: "CHECKBOX",
        isRequired: false,
        sortOrder: 1,
      },
      {
        eventId: workshopEvent.id,
        label: "Previous astrophotography experience",
        type: "SELECT",
        options: { values: ["Never at all", "Tried but not satisfied", "A few times", "Quite experienced"] },
        isRequired: true,
        sortOrder: 2,
      },
      {
        eventId: workshopEvent.id,
        label: "What would you most like to learn?",
        type: "TEXTAREA",
        helpText: "E.g.: photographing the Milky Way, star trails, planets, etc.",
        isRequired: false,
        sortOrder: 3,
      },
    ],
  });

  // ─── Custom form fields for Geminid camping ───
  const geminidEvent = events[7]; // Hujan Meteor Geminid
  await prisma.eventFormField.createMany({
    data: [
      {
        eventId: geminidEvent.id,
        label: "Camping experience",
        type: "SELECT",
        options: { values: ["Never", "1-2 times", "Frequent camper"] },
        isRequired: true,
        sortOrder: 0,
      },
      {
        eventId: geminidEvent.id,
        label: "Food allergies",
        type: "TEXT",
        helpText: "Please mention if you have any food allergies for the BBQ menu.",
        isRequired: false,
        sortOrder: 1,
      },
      {
        eventId: geminidEvent.id,
        label: "Bringing your own sleeping bag?",
        type: "CHECKBOX",
        isRequired: false,
        sortOrder: 2,
      },
      {
        eventId: geminidEvent.id,
        label: "Health history we should know about",
        type: "TEXTAREA",
        helpText: "Optional. For safety during outdoor activities.",
        isRequired: false,
        sortOrder: 3,
      },
    ],
  });

  // ─── Custom form fields for Observatorium Bosscha ───
  const bosschaEvent = events[9]; // Pengamatan Mars di Bosscha
  await prisma.eventFormField.createMany({
    data: [
      {
        eventId: bosschaEvent.id,
        label: "HAAJ membership number",
        type: "TEXT",
        helpText: "This event is exclusively for HAAJ members.",
        isRequired: true,
        sortOrder: 0,
      },
      {
        eventId: bosschaEvent.id,
        label: "Transportation to Lembang",
        type: "SELECT",
        options: { values: ["Private vehicle", "Joining carpool from Jakarta", "Already in Bandung"] },
        isRequired: true,
        sortOrder: 1,
      },
    ],
  });

  // ─── Sample registrations (~60 mixed across all events) ───
  const names = [
    "Amir Nugroho", "Siti Rahayu", "Budi Santoso", "Dewi Lestari", "Rizky Pratama",
    "Anisa Fitri", "Dimas Arya", "Putri Handayani", "Fajar Ramadhan", "Lina Marlina",
    "Hendra Wijaya", "Maya Sari", "Agus Setiawan", "Ratna Dewi", "Irfan Hakim",
    "Nadia Putri", "Yusuf Abdillah", "Kartika Sari", "Bayu Aji", "Indah Permata",
    "Reza Fahlevi", "Dian Sastro", "Andi Muharam", "Sari Wulandari", "Taufik Hidayat",
    "Winda Astuti", "Galih Prakoso", "Rini Susanti", "Arif Rahman", "Dina Mariana",
    "Heru Cahyono", "Fitriani Zahra", "Nanda Prasetyo", "Umi Kalsum", "Joko Susilo",
    "Lia Permata", "Mochammad Ilham", "Tasya Nur", "Oscar Firmansyah", "Vina Agustina",
    "Bagus Wicaksono", "Citra Dewanti", "Eko Purnomo", "Feby Anggraini", "Gilang Ramadhan",
    "Hani Safitri", "Ivan Kurniawan", "Julia Hartono", "Kevin Santoso", "Laras Setiawati",
    "Muhamad Farhan", "Nina Oktaviani", "Okta Pradipta", "Puspita Sari", "Qori Amalia",
    "Rangga Kusuma", "Sinta Maharani", "Teguh Prasetya", "Ulfah Nurjanah", "Wahyu Hidayat",
  ];

  const statuses = [
    ...Array(28).fill(RegistrationStatus.CONFIRMED),
    ...Array(12).fill(RegistrationStatus.PENDING),
    ...Array(8).fill(RegistrationStatus.PENDING_PAYMENT),
    ...Array(5).fill(RegistrationStatus.WAITLISTED),
    ...Array(3).fill(RegistrationStatus.REJECTED),
    ...Array(4).fill(RegistrationStatus.CANCELLED),
  ];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const email = name.toLowerCase().replace(/\s+/g, ".") + "@example.com";
    const eventIndex = i % events.length;
    const event = events[eventIndex];

    await prisma.registration.create({
      data: {
        eventId: event.id,
        ticketCode: randomTicketCode(),
        fullName: name,
        email,
        phone: `+628${String(Math.floor(Math.random() * 10000000000)).padStart(10, "0")}`,
        instagram: Math.random() > 0.5 ? `@${name.toLowerCase().replace(/\s+/g, "")}` : undefined,
        isHaajMember: Math.random() > 0.6,
        status: statuses[i],
        ipAddress: "127.0.0.1",
      },
    });
  }

  // ─── Promo codes ───
  await prisma.promoCode.createMany({
    data: [
      {
        code: "HAAJMEMBER",
        eventId: events[7].id, // Geminid
        discount: 20,
        maxUses: 10,
        usedCount: 3,
        expiresAt: new Date("2026-12-10T23:59:59Z"),
        isActive: true,
      },
      {
        code: "EARLYBIRD",
        eventId: events[4].id, // Workshop Astrofotografi
        discount: 15,
        maxUses: 5,
        usedCount: 5,
        expiresAt: new Date("2026-10-15T23:59:59Z"),
        isActive: false,
      },
      {
        code: "ASTRONOMI2026",
        discount: 10,
        maxUses: 50,
        usedCount: 12,
        expiresAt: new Date("2026-12-31T23:59:59Z"),
        isActive: true,
      },
    ],
  });

  console.log(`Seeded: 3 users, ${events.length} events, ${names.length} registrations, 3 promo codes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
