import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const event = await prisma.event.findUnique({
    where: { id },
    select: { title: true, slug: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const where: any = { eventId: id };
  if (status && status !== "all") {
    where.status = status;
  }

  const registrations = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: {
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
      checkIn: {
        select: {
          checkedInAt: true,
          method: true,
        },
      },
    },
  });

  // CSV headers
  const headers = [
    "Ticket Code",
    "Full Name",
    "Email",
    "Phone",
    "Instagram",
    "HAAJ Member",
    "Member Number",
    "Status",
    "Registered At",
    "Checked In",
    "Check-in Method",
    "Check-in Time",
  ];

  // Add custom field headers from answers
  const allAnswerKeys = new Set<string>();
  registrations.forEach((reg) => {
    if (reg.answers && typeof reg.answers === "object") {
      Object.keys(reg.answers).forEach((key) => allAnswerKeys.add(key));
    }
  });
  const customHeaders = Array.from(allAnswerKeys);
  headers.push(...customHeaders);

  // CSV rows
  const rows = registrations.map((reg) => {
    const row = [
      reg.ticketCode,
      reg.fullName,
      reg.email,
      reg.phone ?? "",
      reg.instagram ?? "",
      reg.isHaajMember ? "Yes" : "No",
      reg.memberNumber ?? "",
      reg.status,
      formatInTimeZone(reg.createdAt, "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss"),
      reg.checkIn ? "Yes" : "No",
      reg.checkIn?.method ?? "",
      reg.checkIn ? formatInTimeZone(reg.checkIn.checkedInAt, "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss") : "",
    ];

    // Add custom field values
    customHeaders.forEach((key) => {
      const value = reg.answers && typeof reg.answers === "object" ? (reg.answers as any)[key] : null;
      row.push(value ?? "");
    });

    return row;
  });

  // Escape CSV values
  const escapeCsv = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  const filename = `${event.slug}-registrations.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
