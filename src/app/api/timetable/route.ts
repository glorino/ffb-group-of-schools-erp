import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "";

    const where: any = {};
    if (classId) where.classId = classId;

    let entries = await prisma.timetableEntry.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, displayName: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Auto-seed timetable if empty
    if (entries.length === 0) {
      const classes = await prisma.schoolClass.findMany({ select: { id: true } });
      const teachers = await prisma.teacher.findMany({ select: { id: true } });
      if (classes.length > 0 && teachers.length > 0) {
        const days = [1, 2, 3, 4, 5];
        const times = [
          { start: "8:00 AM", end: "9:00 AM" },
          { start: "9:00 AM", end: "10:00 AM" },
          { start: "10:00 AM", end: "11:00 AM" },
          { start: "11:00 AM", end: "12:00 PM" },
          { start: "1:00 PM", end: "2:00 PM" },
          { start: "2:00 PM", end: "3:00 PM" },
        ];
        let idx = 0;
        for (const cls of classes) {
          for (const day of days) {
            for (let ti = 0; ti < Math.min(times.length, 5); ti++) {
              try {
                await prisma.timetableEntry.create({
                  data: {
                    classId: cls.id,
                    teacherId: teachers[idx % teachers.length].id,
                    dayOfWeek: day,
                    startTime: times[ti].start,
                    endTime: times[ti].end,
                    room: `Room ${100 + idx % 10}`,
                    type: "lesson",
                  },
                });
                idx++;
              } catch {}
            }
          }
        }
        // Re-fetch after seeding
        entries = await prisma.timetableEntry.findMany({
          where,
          include: {
            class: { select: { id: true, name: true, displayName: true } },
            teacher: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        });
      }
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("GET /api/timetable error:", error);
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]);
    if (authResult.error) return authResult.error;

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
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]);
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
