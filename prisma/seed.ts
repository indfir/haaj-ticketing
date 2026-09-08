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
        title: "Gerhana Bulan Sebagian",
        subtitle: "Partial Lunar Eclipse — Agustus 2026",
        description:
          `Saksikan fenomena gerhana bulan sebagian yang terjadi pada 28 Agustus 2026! Bulan akan memasuki sebagian bayangan umbra Bumi, menciptakan pemandangan dramatis di langit malam Jakarta.

Acara ini akan diadakan di area terbuka Pantai Ancol dengan pemandangan langit yang luas dan minim polusi cahaya. Kami menyediakan teleskop refraktor dan reflektor untuk pengamatan detail permukaan Bulan selama fase gerhana.

Agenda:
• 19:00 WIB — Registrasi & welcome drink
• 19:30 WIB — Pengantar singkat tentang mekanisme gerhana bulan
• 20:15 WIB — Pengamatan fase penumbra
• 21:00 WIB — Puncak gerhana sebagian (pengamatan dengan teleskop)
• 22:30 WIB — Sesi foto & diskusi

Peralatan disediakan oleh HAAJ. Peserta disarankan membawa tikar/alas duduk dan jaket.`,
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
        title: "Oposisi Saturnus 2026",
        subtitle: "Saturnus pada posisi terdekat & tercerahi tahun ini",
        description:
          `Saturnus akan berada pada posisi oposisi pada 2 September 2026 — artinya planet ini berada tepat berseberangan dengan Matahari dilihat dari Bumi. Ini adalah waktu terbaik untuk mengamati Saturnus beserta cincin ikoniknya!

Pengamatan dilakukan di kawasan Puncak, Bogor yang memiliki ketinggian 1.200 mdpl dengan tingkat polusi cahaya yang rendah. HAAJ menyediakan beberapa teleskop berdiameter besar untuk melihat detail cincin Saturnus, Celah Cassini, dan satelit-satelitnya termasuk Titan.

Agenda:
• 18:00 WIB — Berkumpul & registrasi di meeting point
• 18:30 WIB — Presentasi: "Mengenal Saturnus & Sistem Cincinnya"
• 19:30 WIB — Pengamatan Saturnus (teleskop 8" & 10")
• 21:00 WIB — Sesi astrophotography afocal (boleh bawa smartphone)
• 22:00 WIB — Deep-sky tour: Nebula & gugus bintang musim semi
• 23:00 WIB — Penutupan & foto bersama

Transportasi dari Jakarta tidak disediakan. Disarankan menggunakan kendaraan pribadi.`,
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
        paymentInfo: "Transfer ke BCA 1234567890 a/n HAAJ Indonesia. Sertakan bukti transfer saat registrasi.",
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
        subtitle: "Bulan Purnama Perigee — tampak 14% lebih besar",
        description:
          `Bulan purnama pada 28 September 2026 bertepatan dengan posisi perigee (titik terdekat Bulan ke Bumi), menjadikannya supermoon! Bulan akan tampak sekitar 14% lebih besar dan 30% lebih terang dibandingkan bulan purnama biasa.

Lokasi pengamatan di Planetarium Jakarta, Taman Ismail Marzuki — salah satu pusat astronomi tertua di Indonesia. Acara ini cocok untuk keluarga dan pemula yang ingin mengenal astronomi.

Agenda:
• 17:00 WIB — Open gate & tur singkat Planetarium
• 17:30 WIB — Mini lecture: "Apa itu Supermoon?"
• 18:15 WIB — Menonton pertunjukan planetarium (30 menit)
• 19:00 WIB — Pengamatan moonrise dari rooftop
• 19:30 WIB — Observasi detail permukaan Bulan dengan teleskop
• 20:30 WIB — Sesi tanya jawab & penutupan

Cocok untuk semua usia! Anak-anak di bawah 12 tahun wajib didampingi orang tua.`,
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
        paymentInfo: "Termasuk tiket masuk Planetarium. Transfer ke BCA 1234567890 a/n HAAJ Indonesia.",
        contactPerson: "Anisa Nurul",
        contactPhone: "+6285678901234",
        createdById: admin.id,
      },
    }),

    // 4. Hujan Meteor Orionid — 21-22 Oktober 2026
    prisma.event.create({
      data: {
        slug: "hujan-meteor-orionid-oktober-2026",
        title: "Hujan Meteor Orionid 2026",
        subtitle: "Puncak hujan meteor sisa komet Halley",
        description:
          `Hujan meteor Orionid adalah salah satu hujan meteor paling ditunggu setiap tahun, berasal dari sisa debu komet legendaris 1P/Halley. Puncaknya diprediksi pada malam 21-22 Oktober 2026 dengan intensitas hingga 20-25 meteor per jam.

Pengamatan dilakukan di kawasan Taman Nasional Gunung Halimun Salak, area yang sangat gelap dan ideal untuk pengamatan meteor. Kami menyediakan camping area, tenda komunal, dan perlengkapan pengamatan.

Agenda:
• 16:00 WIB — Registrasi & setup tenda
• 17:30 WIB — Makan malam bersama
• 18:30 WIB — Briefing keselamatan & pengenalan rasi bintang
• 20:00 WIB — Pengamatan dimulai (bintang jatuh pertama!)
• 00:00 WIB — Puncak pengamatan — radian Orion di atas horizon
• 03:00 WIB — Golden hour meteor (radian tertinggi)
• 05:00 WIB — Sunrise & penutupan

Termasuk: makan malam, sarapan, tenda komunal, matras. Bawa sleeping bag sendiri.`,
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
        paymentInfo: "Termasuk makan malam, sarapan, tenda komunal, dan matras. Transfer ke BCA 1234567890 a/n HAAJ Indonesia.",
        contactPerson: "Fajar Ramadhan",
        contactPhone: "+6281345678901",
        createdById: organizer.id,
      },
    }),

    // 5. Workshop Astrofotografi — 8 November 2026
    prisma.event.create({
      data: {
        slug: "workshop-astrofotografi-november-2026",
        title: "Workshop Astrofotografi untuk Pemula",
        subtitle: "Dari smartphone hingga DSLR — tangkap keindahan langit malam",
        description:
          `Pernah ingin memotret Milky Way, jejak bintang, atau planet dengan kamera sendiri? Workshop ini dirancang khusus untuk pemula yang ingin memulai perjalanan astrofotografi.

Berlokasi di Science Center PUSPIPTEK Serpong yang memiliki area outdoor luas dan fasilitas indoor untuk sesi teori. Materi mencakup pengaturan kamera untuk astrofotografi, teknik long exposure, stacking, dan post-processing.

Materi:
• Pengenalan astrofotografi: widefield, planetary, deep-sky
• Setting kamera DSLR/mirrorless untuk langit malam
• Teknik smartphone astrophotography (modal HP saja!)
• Komposisi & foreground interest
• Hands-on: pemotretan langit malam di outdoor area
• Post-processing dasar dengan software gratis (GIMP/Sequator)

Peserta wajib membawa:
- Kamera DSLR/mirrorless ATAU smartphone dengan mode manual/pro
- Tripod (wajib)
- Laptop untuk sesi editing (opsional)

Instruktur: Kak Bimo — astrofotografer berpengalaman, kontributor NASA APOD.`,
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
        paymentInfo: "Termasuk materi digital, sertifikat, dan snack. Transfer ke BCA 1234567890 a/n HAAJ Indonesia.",
        contactPerson: "Kartika Putri",
        contactPhone: "+6287654321098",
        createdById: organizer.id,
      },
    }),

    // 6. Hujan Meteor Leonid — 17-18 November 2026
    prisma.event.create({
      data: {
        slug: "hujan-meteor-leonid-november-2026",
        title: "Hujan Meteor Leonid 2026",
        subtitle: "Meteor cepat dari rasi Leo — hingga 15 meteor/jam",
        description:
          `Hujan meteor Leonid berasal dari sisa debu komet 55P/Tempel-Tuttle dan dikenal karena meteoritnya yang sangat cepat — mencapai 71 km/detik! Puncak Leonid 2026 diprediksi pada malam 17-18 November.

Pengamatan akan dilakukan di Kampung Langit Sukabumi, sebuah destinasi astro-tourism yang terkenal dengan langit gelapnya (Bortle Scale 3-4). Lokasi ini berada di ketinggian 800 mdpl dengan horizon terbuka ke arah timur.

Agenda:
• 17:00 WIB — Registrasi & check-in camp
• 18:00 WIB — Makan malam khas Sunda
• 19:00 WIB — Kuliah singkat: "Komet & Hujan Meteor"
• 20:00 WIB — Stargazing & identifikasi rasi bintang
• 23:00 WIB — Pengamatan meteor intensif dimulai
• 02:00 WIB — Puncak Leonid (rasi Leo di atas horizon)
• 04:30 WIB — Pengamatan planet Saturnus & Mars pagi
• 05:30 WIB — Sunrise & sarapan

Termasuk: camping, makan malam & sarapan, peralatan pengamatan.`,
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
        paymentInfo: "Termasuk camping, makan malam Sunda, sarapan, dan peralatan. Transfer ke BCA 1234567890 a/n HAAJ Indonesia.",
        contactPerson: "Reza Fahlevi",
        contactPhone: "+6281987654321",
        createdById: admin.id,
      },
    }),

    // 7. Oposisi Jupiter — 12 Desember 2026
    prisma.event.create({
      data: {
        slug: "oposisi-jupiter-desember-2026",
        title: "Oposisi Jupiter 2026",
        subtitle: "Raja planet pada titik terdekat — amati Great Red Spot!",
        description:
          `Jupiter akan berada pada posisi oposisi pada 12 Desember 2026 — saat terbaik untuk mengamati planet terbesar di tata surya kita! Pada momen ini, Jupiter tampak paling besar dan paling terang sepanjang tahun.

Dengan teleskop, kita bisa melihat detail atmosfer Jupiter: pita-pita awan, Great Red Spot (Bintik Merah Besar), dan keempat bulan Galilean — Io, Europa, Ganymede, dan Callisto.

Pengamatan diadakan di Kebun Raya Bogor yang menyediakan area terbuka dengan pemandangan langit utara yang baik dan suasana tenang di malam hari.

Agenda:
• 18:00 WIB — Open gate & registrasi di Taman Astrid
• 18:30 WIB — Presentasi: "Jupiter — Si Raja Planet"
• 19:15 WIB — Jupiter rise! Pengamatan dimulai
• 20:00 WIB — Rotasi Jupiter: amati perubahan detail atmosfer
• 21:00 WIB — Sesi astrophotography planetary
• 22:00 WIB — Bonus: deep-sky objects musim dingin (Orion Nebula, Pleiades)
• 22:30 WIB — Penutupan

Peralatan: Teleskop 10" Dobsonian, 8" SCT, dan binokular 15x70.`,
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
        paymentInfo: "Termasuk tiket masuk Kebun Raya Bogor malam hari. Transfer ke BCA 1234567890 a/n HAAJ Indonesia.",
        contactPerson: "Hendra Wijaya",
        contactPhone: "+6282345678901",
        createdById: admin.id,
      },
    }),

    // 8. Hujan Meteor Geminid — 13-14 Desember 2026
    prisma.event.create({
      data: {
        slug: "hujan-meteor-geminid-desember-2026",
        title: "Hujan Meteor Geminid 2026",
        subtitle: "Raja hujan meteor — hingga 150 meteor per jam!",
        description:
          `Geminid adalah hujan meteor terkuat dan paling konsisten sepanjang tahun! Dengan intensitas hingga 120-150 meteor per jam pada puncaknya (13-14 Desember), Geminid menghasilkan meteor berwarna-warni: putih, kuning, hijau, merah, dan biru.

Berbeda dari hujan meteor lainnya, Geminid bukan berasal dari komet melainkan dari asteroid 3200 Phaethon — membuatnya unik di antara hujan meteor besar lainnya.

Acara pengamatan ini diadakan di Pantai Carita, Banten — lokasi pesisir dengan horizon terbuka dan minim polusi cahaya. Pengamatan overnight dengan fasilitas camping di tepi pantai.

Agenda:
• 15:00 WIB — Registrasi & setup camp di pinggir pantai
• 17:00 WIB — Sunset watching & briefing
• 18:00 WIB — BBQ dinner di pantai
• 19:30 WIB — Pengenalan rasi bintang musim dingin (Orion, Gemini, Taurus)
• 21:00 WIB — Geminid watching dimulai!
• 00:00 WIB — Puncak intensitas (rasi Gemini di zenith)
• 03:00 WIB — Late night session untuk yang kuat begadang
• 05:30 WIB — Sunrise & sarapan pantai
• 07:00 WIB — Pack up & pulang

Termasuk: camping, BBQ dinner, sarapan, peralatan observasi.`,
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
        paymentInfo: "Termasuk camping, BBQ dinner, sarapan, dan peralatan. Transfer ke BCA 1234567890 a/n HAAJ Indonesia.",
        contactPerson: "Putri Handayani",
        contactPhone: "+6885432109876",
        createdById: organizer.id,
      },
    }),

    // 9. Konjungsi Venus-Saturnus — 22 Januari 2027
    prisma.event.create({
      data: {
        slug: "konjungsi-venus-saturnus-januari-2027",
        title: "Konjungsi Venus & Saturnus",
        subtitle: "Dua planet berdekatan di langit senja",
        description:
          `Pada 22 Januari 2027, Venus dan Saturnus akan tampak sangat berdekatan di langit barat saat senja — sebuah konjungsi yang indah! Kedua planet ini akan terpisah kurang dari 1 derajat, bisa diamati dengan mata telanjang dan lebih detail dengan teleskop.

Venus sebagai objek paling terang di langit (setelah Matahari dan Bulan) akan menjadi pemandu arah, dan Saturnus dengan cincinnya bisa diamati tepat di sebelahnya. Momen langka yang hanya terjadi beberapa tahun sekali!

Lokasi pengamatan di Ragunan, Jakarta Selatan — area terbuka dengan pemandangan langit barat yang baik untuk mengamati objek senja.

Agenda:
• 16:30 WIB — Registrasi & setup teleskop
• 17:00 WIB — Mini lecture: "Mengenal Konjungsi Planet"
• 17:30 WIB — Sunset watching
• 17:50 WIB — Venus muncul! Pengamatan dimulai
• 18:10 WIB — Konjungsi Venus-Saturnus melalui teleskop
• 18:45 WIB — Astrofotografi senja (Venus-Saturnus dengan foreground kota)
• 19:15 WIB — Penutupan

Acara singkat dan gratis — cocok untuk sepulang kerja/kuliah!`,
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
        title: "Observasi Mars: Planet Merah di Langit Malam",
        subtitle: "Mars mendekati oposisi — detail permukaan terlihat!",
        description:
          `Mars akan mendekati posisi oposisi pada awal 2027, dan pada 6 Februari planet merah ini cukup dekat untuk mengamati detail permukaannya: polar ice cap, dataran gelap Syrtis Major, dan formasi awan tipis atmosfer Mars.

Pengamatan dilakukan di Observatorium Bosscha, Lembang — observatorium profesional tertua di Indonesia yang beroperasi sejak 1923. Peserta akan mendapat kesempatan langka menggunakan teleskop bersejarah Zeiss untuk mengamati Mars.

Agenda:
• 17:00 WIB — Registrasi di gerbang Observatorium Bosscha
• 17:30 WIB — Tur observatorium & sejarah astronomi Indonesia
• 18:30 WIB — Kuliah umum: "Mars — Dari Mitologi Hingga Misi Luar Angkasa"
• 19:30 WIB — Pengamatan Mars dengan teleskop refraktor Zeiss
• 20:30 WIB — Rotasi Mars: amati fitur permukaan yang berubah
• 21:30 WIB — Deep-sky tour: Nebula Orion, Gugus Pleiades, Andromeda
• 22:00 WIB — Diskusi & penutupan

Kuota terbatas karena kapasitas observatorium. Perjalanan dari Jakarta sekitar 3 jam via tol Cipularang.`,
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
        paymentInfo: "Termasuk tiket masuk Observatorium Bosscha & donasi perawatan teleskop. Transfer ke BCA 1234567890 a/n HAAJ Indonesia.",
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
        label: "Jenis kamera yang dimiliki",
        type: "SELECT",
        options: { values: ["Smartphone saja", "DSLR", "Mirrorless", "Action cam", "Belum punya"] },
        isRequired: true,
        sortOrder: 0,
      },
      {
        eventId: workshopEvent.id,
        label: "Apakah Anda memiliki tripod?",
        type: "CHECKBOX",
        isRequired: false,
        sortOrder: 1,
      },
      {
        eventId: workshopEvent.id,
        label: "Pengalaman astrofotografi sebelumnya",
        type: "SELECT",
        options: { values: ["Belum pernah sama sekali", "Pernah coba tapi belum puas", "Sudah beberapa kali", "Cukup berpengalaman"] },
        isRequired: true,
        sortOrder: 2,
      },
      {
        eventId: workshopEvent.id,
        label: "Apa yang paling ingin Anda pelajari?",
        type: "TEXTAREA",
        helpText: "Misalnya: memotret Milky Way, star trails, planet, dll.",
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
        label: "Pengalaman camping",
        type: "SELECT",
        options: { values: ["Belum pernah", "1-2 kali", "Sering camping"] },
        isRequired: true,
        sortOrder: 0,
      },
      {
        eventId: geminidEvent.id,
        label: "Alergi makanan",
        type: "TEXT",
        helpText: "Sebutkan jika ada alergi makanan tertentu untuk menu BBQ.",
        isRequired: false,
        sortOrder: 1,
      },
      {
        eventId: geminidEvent.id,
        label: "Membawa sleeping bag sendiri?",
        type: "CHECKBOX",
        isRequired: false,
        sortOrder: 2,
      },
      {
        eventId: geminidEvent.id,
        label: "Riwayat kesehatan yang perlu kami ketahui",
        type: "TEXTAREA",
        helpText: "Opsional. Untuk keselamatan selama kegiatan outdoor.",
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
        label: "Nomor keanggotaan HAAJ",
        type: "TEXT",
        helpText: "Event ini khusus untuk anggota HAAJ.",
        isRequired: true,
        sortOrder: 0,
      },
      {
        eventId: bosschaEvent.id,
        label: "Transportasi ke Lembang",
        type: "SELECT",
        options: { values: ["Kendaraan pribadi", "Ikut carpooling dari Jakarta", "Sudah di Bandung"] },
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
