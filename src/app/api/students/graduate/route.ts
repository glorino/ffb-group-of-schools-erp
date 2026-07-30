import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const currentYear = new Date().getFullYear();

    const sss3Students = await prisma.student.findMany({
      where: {
        status: "active",
        class: { name: { contains: "SSS 3" } },
      },
      include: { class: true },
    });

    if (sss3Students.length === 0) {
      return NextResponse.json({ success: true, message: "No SSS 3 students found to graduate", graduated: 0 });
    }

    let graduated = 0;
    for (const student of sss3Students) {
      if (!student.userId) continue;

      const existing = await prisma.alumni.findFirst({ where: { userId: student.userId! } });
      if (existing) continue;

      try {
        await prisma.alumni.create({
          data: {
            userId: student.userId,
            schoolId: student.schoolId,
            graduationYear: currentYear,
          },
        });

        await prisma.student.update({
          where: { id: student.id },
          data: { status: "graduated", graduationDate: new Date() },
        });

        graduated++;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `${graduated} student(s) graduated to alumni`,
      graduated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Graduation failed" }, { status: 500 });
  }
}
