import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let doc: any = null;
    try {
      doc = await prisma.applicantDocument.findUnique({
        where: { id },
      });
    } catch {
      const rows: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT * FROM "ApplicantDocument" WHERE "id" = $1`, id
      );
      doc = rows?.[0] || null;
    }

    if (!doc || !doc.url) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const dataUrl = doc.url;
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid document format" }, { status: 500 });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/admissions/documents/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}
