import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and PDF are allowed." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Get target folder from form data
    const folder = (formData.get("folder") as string) || "payment-proofs";

    // Sanitize folder path to prevent directory traversal
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-]/g, "");

    // Create unique filename with random suffix
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const ext = file.name.split(".").pop();
    const filename = `${timestamp}-${randomSuffix}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", sanitizedFolder);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${sanitizedFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      filename,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
