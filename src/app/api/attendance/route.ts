import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { AttendanceSchema, AttendanceBulkSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]);
    if (authResult.error) return authResult.error;

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
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const body = await request.json();

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;
    const morningDeadline = 10 * 60; // 10:00 AM
    const afternoonDeadline = 13 * 60; // 1:00 PM
    const sessionType = body.session || "morning";

    // Check time limits (unless it's a bulk update with unlock)
    if (!body.unlocked) {
      if (sessionType === "morning" && currentTime > morningDeadline) {
        return NextResponse.json({ error: "Morning attendance window closed (before 10 AM). Request an unlock from admin.", code: "TIME_CLOSED" }, { status: 400 });
      }
      if (sessionType === "afternoon" && currentTime > afternoonDeadline) {
        return NextResponse.json({ error: "Afternoon attendance window closed (before 1 PM). Request an unlock from admin.", code: "TIME_CLOSED" }, { status: 400 });
      }
    }

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

      // Auto-email parents of absent students
      try {
        const absentStudents = validated.records?.filter((r: any) => r.status === "absent") || [];
        for (const record of absentStudents) {
          const studentId = record.studentId;
          if (!studentId) continue;
          const guardians = await prisma.guardian.findMany({
            where: { studentId, email: { not: null } },
          });
          for (const g of guardians) {
            if (!g.email) continue;
            try {
              const studentInfo = await prisma.student.findUnique({ where: { id: studentId }, select: { firstName: true, lastName: true } });
              const studentName = studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : "Your child";
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://ffb-erp.vercel.app"}/api/emails/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "welcome",
                  to: g.email,
                  name: `${g.firstName} ${g.lastName}`,
                  role: `Attendance Alert: ${studentName} was marked absent on ${new Date().toLocaleDateString()}`,
                }),
              });
            } catch {}
          }
        }
      } catch {}

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

    // Auto-email parents of absent students
    try {
      const absentStudents = record.status === "absent" ? [record] : [];
      for (const r of absentStudents) {
        const studentId = r.studentId;
        if (!studentId) continue;
        const guardians = await prisma.guardian.findMany({
          where: { studentId, email: { not: null } },
        });
        for (const g of guardians) {
          if (!g.email) continue;
          try {
            const studentInfo = await prisma.student.findUnique({ where: { id: studentId }, select: { firstName: true, lastName: true } });
            const studentName = studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : "Your child";
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://ffb-erp.vercel.app"}/api/emails/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "welcome",
                to: g.email,
                name: `${g.firstName} ${g.lastName}`,
                role: `Attendance Alert: ${studentName} was marked absent on ${new Date().toLocaleDateString()}`,
              }),
            });
          } catch {}
        }
      }
    } catch {}

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
