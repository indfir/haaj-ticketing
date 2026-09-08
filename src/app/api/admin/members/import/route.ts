import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function generateMemberQr(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `A-${seg(7)}`;
}

interface RawMemberRow {
  fullName: string;
  memberNumber: string;
  qrCode?: string;
  cluster?: string;
  batch?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

function parseCsv(text: string): RawMemberRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Determine separator (comma, semicolon, tab)
  const headerLine = lines[0];
  const separator = headerLine.includes(";") ? ";" : headerLine.includes("\t") ? "\t" : ",";

  const cleanCol = (col: string) => col.replace(/^["']|["']$/g, "").trim();
  const headers = headerLine.split(separator).map(cleanCol).map((h) => h.toLowerCase());

  const idxName = headers.findIndex((h) => h.includes("nama") || h.includes("name"));
  const idxNum = headers.findIndex((h) => h.includes("nomor") || h.includes("no.") || h.includes("no_") || h.includes("number") || h.includes("npa") || h.includes("id_anggota"));
  const idxQr = headers.findIndex((h) => h.includes("qr") || h.includes("code") || h.includes("barcode") || h.includes("ticket"));
  const idxCluster = headers.findIndex((h) => h.includes("kelompok") || h.includes("cluster") || h.includes("kelas") || h.includes("group"));
  const idxBatch = headers.findIndex((h) => h.includes("angkatan") || h.includes("batch") || h.includes("tahun"));
  const idxEmail = headers.findIndex((h) => h.includes("email") || h.includes("surel"));
  const idxPhone = headers.findIndex((h) => h.includes("tel") || h.includes("phone") || h.includes("hp") || h.includes("wa"));

  const rows: RawMemberRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(separator).map(cleanCol);
    const fullName = idxName !== -1 ? rawCols[idxName] : rawCols[0];
    const memberNumber = idxNum !== -1 ? rawCols[idxNum] : rawCols[1];

    if (!fullName || !memberNumber) continue;

    rows.push({
      fullName,
      memberNumber,
      qrCode: idxQr !== -1 && rawCols[idxQr] ? rawCols[idxQr] : undefined,
      cluster: idxCluster !== -1 ? rawCols[idxCluster] : undefined,
      batch: idxBatch !== -1 ? rawCols[idxBatch] : undefined,
      email: idxEmail !== -1 ? rawCols[idxEmail] : undefined,
      phone: idxPhone !== -1 ? rawCols[idxPhone] : undefined,
    });
  }

  return rows;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const body = await req.json();
  let memberRows: RawMemberRow[] = [];

  if (body.csvText && typeof body.csvText === "string") {
    memberRows = parseCsv(body.csvText);
  } else if (Array.isArray(body.members)) {
    memberRows = body.members;
  }

  if (!memberRows.length) {
    return NextResponse.json(
      { error: { code: "EMPTY_DATA", message: "Tidak ada data anggota valid yang ditemukan. Pastikan format CSV memiliki header dan data." } },
      { status: 400 }
    );
  }

  let created = 0;
  let updated = 0;
  const errors: { row: number; name: string; error: string }[] = [];

  for (let i = 0; i < memberRows.length; i++) {
    const row = memberRows[i];
    try {
      const num = row.memberNumber.trim();
      const name = row.fullName.trim();
      let qr = row.qrCode?.trim();

      if (!qr) {
        qr = generateMemberQr();
      }

      const existing = await prisma.member.findUnique({
        where: { memberNumber: num },
      });

      if (existing) {
        await prisma.member.update({
          where: { id: existing.id },
          data: {
            fullName: name,
            cluster: row.cluster?.trim() || existing.cluster,
            batch: row.batch?.trim() || existing.batch,
            email: row.email?.trim() || existing.email,
            phone: row.phone?.trim() || existing.phone,
            qrCode: row.qrCode?.trim() || existing.qrCode,
          },
        });
        updated++;
      } else {
        // Ensure qrCode is unique
        let qrAttempts = 0;
        while (await prisma.member.findUnique({ where: { qrCode: qr } })) {
          qr = generateMemberQr();
          qrAttempts++;
          if (qrAttempts > 5) throw new Error("Gagal menggenerate kode QR unik");
        }

        await prisma.member.create({
          data: {
            fullName: name,
            memberNumber: num,
            qrCode: qr,
            cluster: row.cluster?.trim() || null,
            batch: row.batch?.trim() || null,
            email: row.email?.trim() || null,
            phone: row.phone?.trim() || null,
            isActive: true,
          },
        });
        created++;
      }
    } catch (err) {
      errors.push({
        row: i + 1,
        name: row.fullName || "Baris " + (i + 1),
        error: err instanceof Error ? err.message : "Gagal import",
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "IMPORT_MEMBERS",
      entityType: "Member",
      entityId: "bulk",
      metadata: {
        total: memberRows.length,
        created,
        updated,
        errorCount: errors.length,
      },
    },
  });

  return NextResponse.json({
    success: true,
    totalProcessed: memberRows.length,
    created,
    updated,
    errors,
  });
}
