import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const schoolId = await getDefaultSchoolId();
    where.schoolId = schoolId;

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("GET /api/subjects error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { name, code, description, category } = body;

    if (!name) {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
    }

    const schoolId = await getDefaultSchoolId();

    const subject = await prisma.subject.create({
      data: {
        schoolId,
        name,
        code: code || undefined,
        description: description || undefined,
        category: category || "core",
      },
    });

    return NextResponse.json({ success: true, subject }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A subject with this name already exists" }, { status: 409 });
    }
    console.error("POST /api/subjects error:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, name, code, description, category } = body;

    if (!id) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name: name || undefined,
        code: code || undefined,
        description: description || undefined,
        category: category || undefined,
      },
    });

    return NextResponse.json({ success: true, subject });
  } catch (error) {
    console.error("PUT /api/subjects error:", error);
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/subjects error:", error);
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
  }
}
