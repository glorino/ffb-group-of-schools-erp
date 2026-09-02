import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;
    const applicantId = formData.get("applicantId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 4MB limit" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Use PDF, JPG, PNG, GIF, or WebP" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    if (applicantId) {
      await prisma.applicantDocument.create({
        data: {
          applicantId,
          name: file.name,
          type: docType || file.type,
          url: dataUrl,
          size: file.size,
        },
      });
    }

    return NextResponse.json({
      success: true,
      url: dataUrl,
      name: file.name,
      type: docType || file.type,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("POST /api/admissions/documents error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
