import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

function generateMemberQr(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `A-${seg(7)}`;
}

const memberSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  memberNumber: z.string().min(1, "Nomor anggota wajib diisi"),
  qrCode: z.string().optional(),
  cluster: z.string().optional(),
  batch: z.string().optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const cluster = searchParams.get("cluster") || "";
  const batch = searchParams.get("batch") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { memberNumber: { contains: q, mode: "insensitive" } },
      { qrCode: { contains: q, mode: "insensitive" } },
      { cluster: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (cluster) where.cluster = cluster;
  if (batch) where.batch = batch;
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const [members, total, clustersRaw, batchesRaw] = await Promise.all([
    prisma.member.findMany({
      where,
      orderBy: { memberNumber: "asc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    }),
    prisma.member.count({ where }),
    prisma.member.findMany({
      where: { cluster: { not: null } },
      select: { cluster: true },
      distinct: ["cluster"],
    }),
    prisma.member.findMany({
      where: { batch: { not: null } },
      select: { batch: true },
      distinct: ["batch"],
    }),
  ]);

  const clusters = clustersRaw.map((c) => c.cluster).filter(Boolean) as string[];
  const batches = batchesRaw.map((b) => b.batch).filter(Boolean) as string[];

  return NextResponse.json({
    members,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    filterOptions: {
      clusters,
      batches,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const body = await req.json();
  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Validasi gagal", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const data = parsed.data;
  let finalQr = data.qrCode?.trim();
  if (!finalQr) {
    finalQr = generateMemberQr();
  }

  // Check unique constraints
  const existingNumber = await prisma.member.findUnique({
    where: { memberNumber: data.memberNumber.trim() },
  });
  if (existingNumber) {
    return NextResponse.json(
      { error: { code: "DUPLICATE_NUMBER", message: `Nomor anggota "${data.memberNumber}" sudah terdaftar` } },
      { status: 409 }
    );
  }

  const existingQr = await prisma.member.findUnique({
    where: { qrCode: finalQr },
  });
  if (existingQr) {
    return NextResponse.json(
      { error: { code: "DUPLICATE_QR", message: `Kode QR "${finalQr}" sudah digunakan oleh anggota lain (${existingQr.fullName})` } },
      { status: 409 }
    );
  }

  const member = await prisma.member.create({
    data: {
      fullName: data.fullName.trim(),
      memberNumber: data.memberNumber.trim(),
      qrCode: finalQr,
      cluster: data.cluster?.trim() || null,
      batch: data.batch?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      isActive: data.isActive,
      notes: data.notes?.trim() || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATE_MEMBER",
      entityType: "Member",
      entityId: member.id,
      metadata: {
        memberNumber: member.memberNumber,
        qrCode: member.qrCode,
      },
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
