import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  // Only SUPERADMIN can create users
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });

  if (currentUser?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Only super admins can create users" } }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "All fields are required" } }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters" } }, { status: 400 });
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return NextResponse.json({ error: { code: "CONFLICT", message: "Email already exists" } }, { status: 409 });
  }

  // Validate role
  const validRoles = ["SUPERADMIN", "ORGANIZER", "CHECKIN_STAFF"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid role" } }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return NextResponse.json(user);
}
