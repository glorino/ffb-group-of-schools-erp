import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultSchoolId } from "@/lib/school";
import { GRADE_SCALE } from "@/lib/constants";

export async function POST() {
  try {
    const schoolId = await getDefaultSchoolId();

    // 1. Create GradingScale entries
    const scaleData = GRADE_SCALE.map((g) => ({
      schoolId,
      name: g.grade,
      minScore: g.min,
      maxScore: g.max,
      grade: g.grade,
      remark: g.label,
      gpa: g.gpa,
    }));

    for (const entry of scaleData) {
      await prisma.gradingScale.upsert({
        where: { schoolId_grade: { schoolId, grade: entry.grade } },
        update: {},
        create: entry,
      });
    }

    // 2. Find existing students with grades
    const students = await prisma.student.findMany({
      where: { schoolId, status: "active" },
      include: {
        grades: { take: 1 },
        class: true,
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    });

    if (students.length === 0) {
      return NextResponse.json({ error: "No students found. Run /api/seed-auto first." }, { status: 400 });
    }

    // 3. Find the current term
    const term = await prisma.term.findFirst({
      where: { isCurrent: true },
      include: { academicYear: true },
    });

    if (!term) {
      return NextResponse.json({ error: "No term found. Run /api/seed-auto first." }, { status: 400 });
    }

    // 4. Create ReportCard for each student that doesn't have one
    const created = [];
    for (const student of students) {
      if (!student.grades.length) continue;

      const existingRC = await prisma.reportCard.findUnique({
        where: { studentId_termId: { studentId: student.id, termId: term.id } },
      });

      if (existingRC) {
        created.push({ studentId: student.id, name: `${student.firstName} ${student.lastName}`, status: "already exists" });
        continue;
      }

      // Compute attendance from records
      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
      });
      const totalDays = attendanceRecords.length || 120;
      const present = attendanceRecords.filter((r) => r.status === "present").length || 110;
      const absent = totalDays - present;

      // Compute position from term result
      const termResult = await prisma.termResult.findFirst({
        where: { studentId: student.id, termId: term.id },
      });

      const comments = [
        "A diligent and hardworking student who consistently demonstrates academic excellence.",
        "Shows great improvement this term. Keep up the good work!",
        "An active participant in class activities with strong leadership potential.",
        "Well-behaved student who is respectful and cooperative.",
        "Needs to put in more effort in Mathematics and Science subjects.",
      ];
      const principalComments = [
        "A model student with excellent character. We are proud of your progress.",
        "Keep striving for excellence. The sky is your limit.",
        "Your dedication to learning is commendable. Continue to shine.",
        "You have shown remarkable improvement. Stay focused.",
        "A well-rounded student. Keep up the excellent work.",
      ];

      const idx = students.indexOf(student);
      const rc = await prisma.reportCard.create({
        data: {
          studentId: student.id,
          termId: term.id,
          academicYear: term.academicYear.name,
          attendanceSummary: { totalDays, present, absent },
          behaviour: "Excellent",
          psychomotor: { "Sports": "Good", "Handwriting": "Very Good", "Creativity": "Excellent" },
          affective: { "Self-Control": "Good", "Respect": "Excellent", "Honesty": "Very Good" },
          teacherComment: comments[idx % comments.length],
          principalComment: principalComments[idx % principalComments.length],
          feesSummary: { tuition: 150000, development: 25000, science: 15000, sports: 10000, total: 200000, paid: 200000, balance: 0 },
        },
      });

      created.push({ studentId: student.id, name: `${student.firstName} ${student.lastName}`, reportCardId: rc.id, status: "created" });
    }

    return NextResponse.json({
      success: true,
      gradingScale: { created: scaleData.length },
      reportCards: created,
      term: { name: term.name, academicYear: term.academicYear.name },
      message: "Demo data seeded successfully",
    });
  } catch (error) {
    console.error("POST /api/seed/demo-reports error:", error);
    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 });
  }
}
