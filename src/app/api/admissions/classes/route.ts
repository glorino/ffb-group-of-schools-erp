import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET() {
  try {
    const schoolId = await getDefaultSchoolId();

    const classes = await prisma.schoolClass.findMany({
      where: { schoolId },
      select: {
        name: true,
        displayName: true,
        capacity: true,
        _count: { select: { students: true } },
      },
      orderBy: { level: "asc" },
    });

    const admittedCount = await prisma.applicant.groupBy({
      by: ["classAppliedFor"],
      where: { schoolId, status: "admitted" },
      _count: { id: true },
    });

    const admittedMap: Record<string, number> = {};
    admittedCount.forEach((row) => {
      admittedMap[row.classAppliedFor] = row._count.id;
    });

    const result = classes.map((c) => {
      const enrolled = c._count.students;
      const pendingAdmissions = admittedMap[c.name] || 0;
      const totalOccupied = enrolled + pendingAdmissions;
      return {
        name: c.name,
        displayName: c.displayName || c.name,
        capacity: c.capacity,
        enrolled,
        pendingAdmissions,
        totalOccupied,
        isFull: totalOccupied >= c.capacity,
        remaining: Math.max(0, c.capacity - totalOccupied),
      };
    });

    return NextResponse.json({ classes: result });
  } catch (error) {
    console.error("GET /api/admissions/classes error:", error);
    return NextResponse.json({ classes: [] });
  }
}
