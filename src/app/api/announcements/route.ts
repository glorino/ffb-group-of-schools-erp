import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const announcements = await prisma.announcement.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    const publishedCount = announcements.filter(a => a.published).length;
    return NextResponse.json({ announcements, stats: { total: announcements.length, published: publishedCount } });
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, content, type, priority, published } = body;

    if (!title || !content) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const schoolId = await getDefaultSchoolId();
    const announcement = await prisma.announcement.create({
      data: {
        schoolId,
        title,
        content,
        type: type || "general",
        priority: priority || "normal",
        published: published !== false,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
