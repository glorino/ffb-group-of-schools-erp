import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const termId = searchParams.get("termId");

    if (!studentId || !termId) {
      return NextResponse.json(
        { error: "studentId and termId are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: { include: { classTeacher: true } },
        school: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: { academicYear: true },
    });

    if (!term) {
      return NextResponse.json({ error: "Term not found" }, { status: 404 });
    }

    const grades = await prisma.grade.findMany({
      where: { studentId, term: term.name, session: term.academicYear.name },
      include: { subject: true, teacher: true },
    });

    const subjectGrades = grades.reduce(
      (acc, grade) => {
        const subjectId = grade.subjectId;
        if (!acc[subjectId]) {
          acc[subjectId] = {
            subject: grade.subject.name,
            subjectCode: grade.subject.code,
            teacher: grade.teacher
              ? `${grade.teacher.firstName} ${grade.teacher.lastName}`
              : "",
            ca1: 0,
            ca2: 0,
            ca3: 0,
            exam: 0,
            total: 0,
            grade: "",
            remark: "",
          };
        }

        const entry = acc[subjectId];
        switch (grade.type) {
          case "ca1":
            entry.ca1 = grade.score;
            break;
          case "ca2":
            entry.ca2 = grade.score;
            break;
          case "ca3":
            entry.ca3 = grade.score;
            break;
          case "exam":
            entry.exam = grade.score;
            break;
          default:
            break;
        }

        entry.total = entry.ca1 + entry.ca2 + entry.ca3 + entry.exam;
        entry.grade = grade.grade || "";
        entry.remark = grade.comments || "";

        return acc;
      },
      {} as Record<
        string,
        {
          subject: string;
          subjectCode: string;
          teacher: string;
          ca1: number;
          ca2: number;
          ca3: number;
          exam: number;
          total: number;
          grade: string;
          remark: string;
        }
      >
    );

    const subjects = Object.values(subjectGrades).sort((a, b) =>
      a.subject.localeCompare(b.subject)
    );

    const gradingScale = await prisma.gradingScale.findMany({
      where: { schoolId: student.schoolId },
      orderBy: { minScore: "desc" },
    });

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId, termId },
    });

    const totalSchoolDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (r) => r.status === "present"
    ).length;
    const absentDays = totalSchoolDays - presentDays;

    const termResult = await prisma.termResult.findFirst({
      where: { studentId, termId },
    });

    const reportCard = await prisma.reportCard.findFirst({
      where: { studentId, termId },
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName}`,
        admissionNumber: student.admissionNumber,
        className: student.class?.displayName || student.class?.name || "",
        photo: student.photo,
        qrCode: student.qrCode,
      },
      term: {
        id: term.id,
        name: term.name,
        academicYear: term.academicYear.name,
        startDate: term.startDate,
        endDate: term.endDate,
      },
      school: {
        name: student.school.name,
        address: student.school.address,
        logo: student.school.logo,
      },
      subjects,
      gradingScale,
      attendance: {
        totalDays: totalSchoolDays,
        present: presentDays,
        absent: absentDays,
      },
      termResult: termResult
        ? {
            totalScore: termResult.totalScore,
            average: termResult.average,
            position: termResult.position,
            classSize: termResult.classSize,
            remark: termResult.remark,
            promoted: termResult.promoted,
          }
        : null,
      behaviour: reportCard?.behaviour || null,
      psychomotor: reportCard?.psychomotor || null,
      affective: reportCard?.affective || null,
      teacherComment: reportCard?.teacherComment || null,
      principalComment: reportCard?.principalComment || null,
      classTeacher: student.class?.classTeacher?.name || null,
    });
  } catch (error) {
    console.error("GET /api/reports/report-card error:", error);
    return NextResponse.json(
      { error: "Failed to generate report card" },
      { status: 500 }
    );
  }
}
