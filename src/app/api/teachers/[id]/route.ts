import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { id } = await params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        teacherSubjects: { include: { subject: true } },
        user: { select: { id: true, email: true, image: true, lastLoginAt: true } },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Fetch timetable entries for this teacher
    const timetable = await prisma.timetableEntry.findMany({
      where: { teacherId: id },
      include: { class: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Fetch classes this teacher is assigned to
    const assignedClassIds = [...new Set(timetable.map((t) => t.classId).filter(Boolean))];
    const assignedClasses = assignedClassIds.length
      ? await prisma.schoolClass.findMany({ where: { id: { in: assignedClassIds } } })
      : [];

    // Fetch attendance records this teacher has marked
    const attendanceCount = await prisma.attendanceRecord.count({
      where: { recordedBy: id },
    });

    return NextResponse.json({
      teacher,
      timetable,
      assignedClasses,
      stats: {
        timetableEntries: timetable.length,
        assignedClasses: assignedClasses.length,
        attendanceMarked: attendanceCount,
      },
    });
  } catch (error) {
    console.error("GET /api/teachers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { id } = await params;
    const body = await request.json();

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        email: body.email,
        qualification: body.qualification,
        specialization: body.specialization,
        status: body.status,
      },
      include: {
        teacherSubjects: { include: { subject: true } },
      },
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("PUT /api/teachers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const { id } = await params;

    await prisma.teacherSubject.deleteMany({ where: { teacherId: id } });
    await prisma.teacher.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/teachers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
