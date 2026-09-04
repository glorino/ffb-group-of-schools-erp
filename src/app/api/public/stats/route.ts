import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET() {
  try {
    const schoolId = await getDefaultSchoolId();

    const [totalStudents, totalTeachers, totalStaff, school] = await Promise.all([
      prisma.student.count({ where: { schoolId, status: "active" } }),
      prisma.teacher.count({ where: { schoolId, status: "active" } }),
      prisma.staff.count({ where: { schoolId, status: "active" } }),
      prisma.school.findUnique({
        where: { id: schoolId },
        select: { establishedAt: true, name: true, motto: true, mission: true, vision: true, coreValues: true, founderMessage: true, address: true, phone: true, email: true, logo: true },
      }),
    ]);

    const yearsSince = school?.establishedAt
      ? Math.floor((Date.now() - new Date(school.establishedAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalStaff,
      yearsSince,
      school,
    });
  } catch (error) {
    console.error("GET /api/public/stats error:", error);
    return NextResponse.json({ totalStudents: 0, totalTeachers: 0, totalStaff: 0, yearsSince: null, school: null });
  }
}
