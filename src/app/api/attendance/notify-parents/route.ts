import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { sendAbsenceNotification } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { date, session } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      date: { gte: startOfDay, lte: endOfDay },
      status: "absent",
    };

    if (session) {
      where.session = session;
    }

    const absentRecords = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (absentRecords.length === 0) {
      return NextResponse.json({ success: true, notified: 0 });
    }

    const formattedDate = new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let notified = 0;

    for (const record of absentRecords) {
      if (!record.student) continue;

      const studentId = record.student.id;
      const studentName = `${record.student.firstName} ${record.student.lastName}`;

      const guardians = await prisma.guardian.findMany({
        where: {
          studentId,
          email: { not: null },
        },
      });

      for (const guardian of guardians) {
        if (!guardian.email) continue;
        try {
          await sendAbsenceNotification(
            `${guardian.firstName} ${guardian.lastName}`,
            guardian.email,
            studentName,
            formattedDate
          );
          notified++;
        } catch (emailError) {
          console.error(`Failed to send email to ${guardian.email}:`, emailError);
        }
      }
    }

    return NextResponse.json({ success: true, notified });
  } catch (error) {
    console.error("POST /api/attendance/notify-parents error:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
