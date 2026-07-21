import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get current term and academic year
    const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const currentTerm = await prisma.term.findFirst({ where: { isCurrent: true } });

    if (!currentYear || !currentTerm) {
      return NextResponse.json({ success: true, classPerformance: [], gradeDistribution: [], attendanceTrend: [], recentGrades: [] });
    }

    // Get all teachers
    const teachers = await prisma.teacher.findMany({ where: { status: "active" } });
    const teacherIds = teachers.map(t => t.id);

    // Class performance - average scores per class
    const classes = await prisma.schoolClass.findMany({
      where: { academicYearId: currentYear.id },
      include: { students: { include: { grades: { where: { term: currentTerm.name, session: currentYear.name } } } } },
    });

    const classPerformance = classes.map(c => {
      const allScores = c.students.flatMap(s => s.grades.map(g => (g.score / g.maxScore) * 100));
      return {
        class: c.name,
        average: allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0,
      };
    }).filter(c => c.average > 0).slice(0, 10);

    // Grade distribution
    const allGrades = await prisma.grade.findMany({
      where: { term: currentTerm.name, session: currentYear.name },
    });

    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    allGrades.forEach(g => {
      const pct = (g.score / g.maxScore) * 100;
      if (pct >= 70) gradeCounts.A++;
      else if (pct >= 60) gradeCounts.B++;
      else if (pct >= 50) gradeCounts.C++;
      else if (pct >= 40) gradeCounts.D++;
      else if (pct >= 30) gradeCounts.E++;
      else gradeCounts.F++;
    });

    const gradeDistribution = Object.entries(gradeCounts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    // Attendance trend (last 4 weeks)
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { date: { gte: fourWeeksAgo } },
    });

    const weekBuckets: { week: string; present: number; total: number }[] = [
      { week: "Week 1", present: 0, total: 0 },
      { week: "Week 2", present: 0, total: 0 },
      { week: "Week 3", present: 0, total: 0 },
      { week: "Week 4", present: 0, total: 0 },
    ];

    attendanceRecords.forEach(r => {
      const diffDays = Math.floor((now.getTime() - new Date(r.date).getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekIdx = Math.min(3, diffDays);
      weekBuckets[weekIdx].total++;
      if (r.status === "present") weekBuckets[weekIdx].present++;
    });

    const attendanceTrend = weekBuckets.map(w => ({
      week: w.week,
      rate: w.total > 0 ? Math.round((w.present / w.total) * 100) : 0,
    })).reverse();

    // Recent grades entered
    const recentGrades = await prisma.grade.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { student: true, subject: true },
    });

    return NextResponse.json({
      success: true,
      classPerformance,
      gradeDistribution,
      attendanceTrend,
      recentGrades: recentGrades.map(g => ({
        studentName: `${g.student.firstName} ${g.student.lastName}`,
        subject: g.subject.name,
        score: g.score,
        grade: g.grade,
        createdAt: g.createdAt,
      })),
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return NextResponse.json({ success: true, classPerformance: [], gradeDistribution: [], attendanceTrend: [], recentGrades: [] });
  }
}
