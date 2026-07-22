import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"]);
    if (authResult.error) return authResult.error;

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
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;
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

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, title, content, type, priority, published } = body;

    if (!id) return NextResponse.json({ error: "Missing announcement ID" }, { status: 400 });

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("PUT /api/announcements error:", error);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/announcements error:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
