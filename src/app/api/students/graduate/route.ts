import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
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
            graduationYear: currentYear,
          },
        });

        await prisma.student.update({
          where: { id: student.id },
          data: { status: "graduated", graduationDate: new Date() },
        });

        graduated++;
      } catch {
        // Skip on error
      }
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
