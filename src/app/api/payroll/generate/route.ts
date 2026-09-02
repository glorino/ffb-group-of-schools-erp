import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "ACCOUNTANT"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json({ error: "month and year are required" }, { status: 400 });
    }

    const teachers = await prisma.teacher.findMany({
      where: { status: "active" },
      include: { user: true },
    });

    if (teachers.length === 0) {
      return NextResponse.json({ error: "No active teachers found" }, { status: 404 });
    }

    const existing = await prisma.payroll.findMany({
      where: { month, year: parseInt(year) },
      select: { teacherId: true },
    });
    const existingIds = new Set(existing.map((p) => p.teacherId));

    const created: string[] = [];
    const skipped: string[] = [];

    for (const teacher of teachers) {
      if (existingIds.has(teacher.id)) {
        skipped.push(`${teacher.firstName} ${teacher.lastName}`);
        continue;
      }

      const basicSalary = 150000;
      const allowances = 30000;
      const deductions = 15000;
      const netSalary = basicSalary + allowances - deductions;

      await prisma.payroll.create({
        data: {
          teacherId: teacher.id,
          month,
          year: parseInt(year),
          basicSalary,
          allowances,
          deductions,
          netSalary,
          status: "pending",
        },
      });
      created.push(`${teacher.firstName} ${teacher.lastName}`);
    }

    return NextResponse.json({
      success: true,
      message: `Auto-generated payroll for ${created.length} staff (${skipped.length} already had entries)`,
      created,
      skipped,
      month,
      year,
    });
  } catch (error) {
    console.error("POST /api/payroll/generate error:", error);
    return NextResponse.json({ error: "Failed to auto-generate payroll" }, { status: 500 });
  }
}
