import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  // Only SUPERADMIN can update users
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });

  if (currentUser?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Only super admins can update users" } }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, email, role, isActive, newPassword } = body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
  }

  // Check if email is already taken by another user
  if (email && email !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (emailTaken && emailTaken.id !== id) {
      return NextResponse.json({ error: { code: "CONFLICT", message: "Email already exists" } }, { status: 409 });
    }
  }

  // Validate role
  const validRoles = ["SUPERADMIN", "ORGANIZER", "CHECKIN_STAFF"];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid role" } }, { status: 400 });
  }

  // Build update data
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email.toLowerCase();
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters" } }, { status: 400 });
    }
    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  // Only SUPERADMIN can delete users
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  });

  if (currentUser?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Only super admins can delete users" } }, { status: 403 });
  }

  const { id } = await params;

  // Prevent deleting yourself
  const userToDelete = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });

  if (userToDelete?.email === session.user.email) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Cannot delete your own account" } }, { status: 403 });
  }

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          createdEvents: true,
          checkIns: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
  }

  return NextResponse.json(user);
}
