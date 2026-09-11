import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const members = await prisma.member.findMany({
    orderBy: { memberNumber: "asc" },
  });

  const headers = ["Member Number", "Full Name", "QR Code", "Cluster", "Batch", "Email", "Phone", "Status", "Registered On"];
  const rows = members.map((m) => [
    `"${m.memberNumber}"`,
    `"${m.fullName.replace(/"/g, '""')}"`,
    `"${m.qrCode}"`,
    `"${m.cluster || ""}"`,
    `"${m.batch || ""}"`,
    `"${m.email || ""}"`,
    `"${m.phone || ""}"`,
    m.isActive ? "Active" : "Inactive",
    m.createdAt.toISOString().slice(0, 10),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="haaj-member-data-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
