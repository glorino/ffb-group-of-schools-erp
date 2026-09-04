import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

const GRADE_SCALE = [
  { grade: "A1", min: 75, max: 100, gpa: 4.0, label: "Excellent" },
  { grade: "B2", min: 70, max: 74, gpa: 3.5, label: "Very Good" },
  { grade: "B3", min: 65, max: 69, gpa: 3.0, label: "Good" },
  { grade: "C4", min: 60, max: 64, gpa: 2.5, label: "Credit" },
  { grade: "C5", min: 55, max: 59, gpa: 2.0, label: "Credit" },
  { grade: "C6", min: 50, max: 54, gpa: 1.5, label: "Credit" },
  { grade: "D7", min: 45, max: 49, gpa: 1.0, label: "Pass" },
  { grade: "E8", min: 40, max: 44, gpa: 0.5, label: "Pass" },
  { grade: "F9", min: 0, max: 39, gpa: 0.0, label: "Fail" },
];

async function main() {
  const school = await prisma.school.findFirst({ where: { slug: "ffb-main" } });
  if (!school) { console.error("No school found. Run seed-auto first."); process.exit(1); }
  console.log("School:", school.name, school.id);

  // 1. Create GradingScale
  for (const g of GRADE_SCALE) {
    await prisma.gradingScale.upsert({
      where: { schoolId_grade: { schoolId: school.id, grade: g.grade } },
      update: {},
      create: { schoolId: school.id, name: g.grade, minScore: g.min, maxScore: g.max, grade: g.grade, remark: g.label, gpa: g.gpa },
    });
  }
  console.log("GradingScale entries created:", GRADE_SCALE.length);

  // 2. Find term + academic year
  const term = await prisma.term.findFirst({ where: { isCurrent: true }, include: { academicYear: true } });
  if (!term) { console.error("No term found. Run seed-auto first."); process.exit(1); }
  console.log("Term:", term.name, "Year:", term.academicYear.name);

  // 3. Find students with grades
  const students = await prisma.student.findMany({
    where: { schoolId: school.id, status: "active" },
    include: { grades: true, class: true },
    orderBy: { createdAt: "asc" },
  });
  console.log("Students found:", students.length);

  if (students.length === 0) {
    console.error("No students found. Run seed-auto first.");
    process.exit(1);
  }

  // 4. Create ReportCards
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

  let created = 0;
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (s.grades.length === 0) continue;

    const existing = await prisma.reportCard.findUnique({
      where: { studentId_termId: { studentId: s.id, termId: term.id } },
    });
    if (existing) { console.log(`  ReportCard already exists for ${s.firstName} ${s.lastName}`); continue; }

    const attendanceRecords = await prisma.attendanceRecord.findMany({ where: { studentId: s.id } });
    const totalDays = Math.max(attendanceRecords.length, 120);
    const present = Math.max(attendanceRecords.filter(r => r.status === "present").length, 110);
    const absent = totalDays - present;

    await prisma.reportCard.create({
      data: {
        studentId: s.id,
        termId: term.id,
        academicYear: term.academicYear.name,
        attendanceSummary: { totalDays, present, absent },
        behaviour: "Excellent",
        psychomotor: { "Sports": "Good", "Handwriting": "Very Good", "Creativity": "Excellent" },
        affective: { "Self-Control": "Good", "Respect": "Excellent", "Honesty": "Very Good" },
        teacherComment: comments[i % comments.length],
        principalComment: principalComments[i % principalComments.length],
        feesSummary: { tuition: 150000, development: 25000, science: 15000, sports: 10000, total: 200000, paid: 200000, balance: 0 },
      },
    });
    created++;
    console.log(`  ReportCard created for ${s.firstName} ${s.lastName} (${s.class?.displayName || s.classId})`);
  }

  console.log(`\nDone! Created ${created} ReportCards. GradingScale: ${GRADE_SCALE.length} entries.`);
  console.log(`\nStudents to preview:`);
  for (const s of students.slice(0, 5)) {
    console.log(`  - ${s.firstName} ${s.lastName} (${s.class?.displayName || s.classId}) ID: ${s.id}`);
  }
  console.log(`\nTerm ID: ${term.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
