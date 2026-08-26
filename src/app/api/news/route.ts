import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"]);
    if (authResult.error) return authResult.error;

    const schoolId = await getDefaultSchoolId();
    const announcements = await prisma.announcement.findMany({
      where: { schoolId, type: "news" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("GET /api/news error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { title, content, priority, published, target } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const schoolId = await getDefaultSchoolId();
    const announcement = await prisma.announcement.create({
      data: {
        schoolId,
        title,
        content,
        type: "news",
        priority: priority || "medium",
        published: published !== undefined ? published : true,
        target: target ? JSON.stringify(target) : undefined,
      },
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error("POST /api/news error:", error);
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, title, content, priority, published, target } = body;

    if (!id) return NextResponse.json({ error: "Missing news ID" }, { status: 400 });

    const existing = await prisma.announcement.findUnique({ where: { id } });
    let mergedTarget = existing?.target as Record<string, any> | undefined;
    if (target) {
      mergedTarget = { ...(mergedTarget || {}), ...target };
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(priority && { priority }),
        ...(published !== undefined && { published }),
        ...(mergedTarget && { target: JSON.stringify(mergedTarget) }),
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("PUT /api/news error:", error);
    return NextResponse.json({ error: "Failed to update news" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/news error:", error);
    return NextResponse.json({ error: "Failed to delete news" }, { status: 500 });
  }
}
