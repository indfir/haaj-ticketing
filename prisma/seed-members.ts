import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL || "postgresql://haaj:haaj_dev@localhost:5432/haaj_ticketing?schema=public";
const localDbUrl = dbUrl.replace("@postgres:", "@localhost:");

const adapter = new PrismaPg(localDbUrl);
const prisma = new PrismaClient({ adapter });

async function seedMembers() {
  const members = [
    {
      fullName: "ADE DEWIJANTI",
      memberNumber: "20258404001",
      qrCode: "A-AV5G7B6",
      cluster: "CASTOR-POLLUX",
      batch: "2025",
      email: "ade.dewijanti@example.com",
      phone: "081234567890",
      notes: "Kartu fisik 2 sisi terbitan Badan Pengurus HAAJ 2026",
    },
    {
      fullName: "REZKY HAAJ",
      memberNumber: "20258404002",
      qrCode: "A-RZK88P1",
      cluster: "BETELGEUSE",
      batch: "2025",
      email: "rezky@haaj.id",
      phone: "081298765432",
      notes: "Pengurus HAAJ",
    },
    {
      fullName: "SIENIK ANGLITA",
      memberNumber: "20258404003",
      qrCode: "A-SNK99Q2",
      cluster: "SIRIUS",
      batch: "2025",
      email: "sienik@haaj.id",
      phone: "081345678901",
      notes: "Designer Kartu Anggota (Rotanev 2023)",
    },
    {
      fullName: "INDRA FIRDAUS",
      memberNumber: "20248401001",
      qrCode: "A-IND77K3",
      cluster: "ANTARES",
      batch: "2024",
      email: "indra@haaj.id",
      phone: "081122334455",
      notes: "Web Ticketing & System Developer",
    },
  ];

  console.log("Seeding members...");
  for (const m of members) {
    const upserted = await prisma.member.upsert({
      where: { memberNumber: m.memberNumber },
      update: m,
      create: m,
    });
    console.log(`✓ Member: ${upserted.fullName} (${upserted.memberNumber}) - QR: ${upserted.qrCode}`);
  }

  const user = await prisma.user.findFirst();
  if (user) {
    const pruEvent = await prisma.event.upsert({
      where: { slug: "pertemuan-rutin-umum-pru-september-2026" },
      update: {},
      create: {
        slug: "pertemuan-rutin-umum-pru-september-2026",
        title: "Pertemuan Rutin Umum (PRU) — September 2026",
        subtitle: "Pertemuan Rutin Anggota HAAJ",
        description: "Pertemuan Rutin Umum Himpunan Astronomi Amatir Jakarta dengan agenda pembahasan langit malam dan pengamatan bersama.",
        category: "MEETUP",
        status: "PUBLISHED",
        startAt: new Date("2026-09-12T14:00:00+07:00"),
        endAt: new Date("2026-09-12T18:00:00+07:00"),
        locationName: "Planetarium dan Observatorium Jakarta",
        locationAddress: "Jl. Cikini Raya No. 73, Jakarta Pusat 10330",
        isMembersOnly: true,
        createdById: user.id,
      },
    });
    console.log(`✓ Event: ${pruEvent.title} (${pruEvent.slug})`);
  }

  console.log("Member seeding completed successfully!");
}

seedMembers()
  .catch((e) => {
    console.error("Error seeding members:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
