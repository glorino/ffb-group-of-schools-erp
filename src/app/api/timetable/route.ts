import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "";

    const where: any = {};
    if (classId) where.classId = classId;

    const entries = await prisma.timetableEntry.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, displayName: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("GET /api/timetable error:", error);
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { classId, teacherId, dayOfWeek, startTime, endTime, room, type } = body;

    if (!classId || !teacherId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const entry = await prisma.timetableEntry.create({
      data: {
        classId,
        teacherId,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        room: room || undefined,
        type: type || "lesson",
      },
      include: {
        class: { select: { id: true, name: true, displayName: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "This time slot is already taken for this class" }, { status: 409 });
    }
    console.error("POST /api/timetable error:", error);
    return NextResponse.json({ error: "Failed to create timetable entry" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.timetableEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/timetable error:", error);
    return NextResponse.json({ error: "Failed to delete timetable entry" }, { status: 500 });
  }
}
