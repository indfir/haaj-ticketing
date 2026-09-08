import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { RegistrationStatus } from "@/generated/prisma/enums";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "25")));
  const search = url.searchParams.get("search") ?? "";
  const status = url.searchParams.get("status");

  const where = {
    eventId: id,
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { ticketCode: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status && status !== "all" ? { status: status as RegistrationStatus } : {}),
  };

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        ticketCode: true,
        fullName: true,
        email: true,
        phone: true,
        instagram: true,
        isHaajMember: true,
        memberNumber: true,
        status: true,
        answers: true,
        createdAt: true,
        checkIn: { select: { checkedInAt: true, method: true } },
      },
    }),
    prisma.registration.count({ where }),
  ]);

  return NextResponse.json({
    registrations,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
