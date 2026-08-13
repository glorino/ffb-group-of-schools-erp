import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { TimetableEntrySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]);
    if (authResult.error) return authResult.error;

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
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = TimetableEntrySchema.parse(body);
    const { classId, teacherId, dayOfWeek, startTime, endTime } = validated;

    const entry = await prisma.timetableEntry.create({
      data: {
        classId,
        teacherId,
        subject: validated.subjectId || undefined,
        dayOfWeek,
        startTime,
        endTime,
        room: validated.room || undefined,
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

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, classId, teacherId, dayOfWeek, startTime, endTime, room, subject, type } = body;

    if (!id) return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });

    const entry = await prisma.timetableEntry.update({
      where: { id },
      data: {
        classId: classId || undefined,
        teacherId: teacherId || undefined,
        dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        room: room || undefined,
        subject: subject || undefined,
        type: type || undefined,
      },
      include: {
        class: { select: { id: true, name: true, displayName: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("PUT /api/timetable error:", error);
    return NextResponse.json({ error: "Failed to update timetable entry" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

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
