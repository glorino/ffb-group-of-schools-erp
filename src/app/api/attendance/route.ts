import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AttendanceSchema, AttendanceBulkSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    if (classId) where.classId = classId;
    if (studentId) where.studentId = studentId;

    const [records, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true,
            },
          },
          class: {
            select: { id: true, name: true, displayName: true },
          },
        },
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.attendanceRecord.count({ where }),
    ]);

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();

    if (body.records && Array.isArray(body.records)) {
      const validated = AttendanceBulkSchema.parse(body);

      const results = await prisma.$transaction(
        validated.records.map((record: any) =>
          prisma.attendanceRecord.upsert({
            where: {
              studentId_date_session: {
                studentId: record.studentId,
                date: new Date(validated.date),
                session: validated.session,
              },
            },
            update: {
              status: record.status,
              notes: record.notes,
              recordedBy: userId,
            },
            create: {
              studentId: record.studentId,
              classId: validated.classId,
              termId: validated.termId,
              date: new Date(validated.date),
              session: validated.session,
              status: record.status,
              notes: record.notes,
              recordedBy: userId,
            },
          })
        )
      );

      return NextResponse.json({ message: "Attendance recorded", count: results.length });
    }

    const validated = AttendanceSchema.parse(body);

    const record = await prisma.attendanceRecord.upsert({
      where: {
        studentId_date_session: {
          studentId: validated.studentId,
          date: new Date(validated.date),
          session: validated.session,
        },
      },
      update: {
        status: validated.status,
        notes: validated.notes,
        classId: validated.classId,
        termId: validated.termId,
        recordedBy: session.user.id,
      },
      create: {
        studentId: validated.studentId,
        classId: validated.classId,
        termId: validated.termId,
        date: new Date(validated.date),
        session: validated.session,
        status: validated.status,
        notes: validated.notes,
        recordedBy: session.user.id,
      },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNumber: true },
        },
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    console.error("POST /api/attendance error:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}
