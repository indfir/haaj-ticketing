import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          startAt: true,
          category: true,
          priceIDR: true,
          coverImageUrl: true,
          _count: { select: { registrations: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ wishlist });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await req.json();
  if (!eventId) {
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  }

  try {
    const wishlist = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        eventId,
      },
    });
    return NextResponse.json({ wishlist, added: true });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Already in wishlist, remove it
      await prisma.wishlist.deleteMany({
        where: { userId: session.user.id, eventId },
      });
      return NextResponse.json({ added: false });
    }
    throw error;
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await req.json();
  if (!eventId) {
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  }

  await prisma.wishlist.deleteMany({
    where: { userId: session.user.id, eventId },
  });

  return NextResponse.json({ success: true });
}
