import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const member = await prisma.member.findUnique({
    where: { id },
  });

  if (!member) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Member not found" } }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const download = searchParams.get("download") === "true";

  try {
    const pngBuffer = await QRCode.toBuffer(member.qrCode, {
      margin: 2,
      width: 400,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    };

    if (download) {
      headers["Content-Disposition"] = `attachment; filename="qr-anggota-${member.memberNumber}-${member.qrCode}.png"`;
    }

    return new NextResponse(pngBuffer as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "QR_GEN_ERROR", message: "Failed to generate QR code" } },
      { status: 500 }
    );
  }
}
