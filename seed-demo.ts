import "dotenv/config";
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
});

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
  await client.connect();
  console.log("Connected to DB");

  const schoolRes = await client.query(`SELECT id, name FROM "School" WHERE slug = 'ffb-main' LIMIT 1`);
  if (schoolRes.rows.length === 0) { console.error("No school found"); process.exit(1); }
  const schoolId = schoolRes.rows[0].id;
  console.log("School:", schoolRes.rows[0].name, schoolId);

  for (const g of GRADE_SCALE) {
    await client.query(
      `INSERT INTO "GradingScale" ("id", "schoolId", "name", "minScore", "maxScore", "grade", "remark", "gpa", "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT ("schoolId", "grade") DO NOTHING`,
      [schoolId, g.grade, g.min, g.max, g.grade, g.label, g.gpa]
    );
  }
  console.log("GradingScale entries created");

  const termRes = await client.query(`
    SELECT t.id, t.name, ay.name as "yearName"
    FROM "Term" t JOIN "AcademicYear" ay ON t."academicYearId" = ay.id
    WHERE t."isCurrent" = true LIMIT 1
  `);
  if (termRes.rows.length === 0) { console.error("No term found"); process.exit(1); }
  const term = termRes.rows[0];
  console.log("Term:", term.name, "Year:", term.yearName);

  // Get subjects
  const subjectsRes = await client.query(`SELECT id, name FROM "Subject" WHERE "schoolId" = $1`, [schoolId]);
  const subjectMap = new Map(subjectsRes.rows.map((s: any) => [s.name, s.id]));
  console.log("Subjects found:", subjectMap.size);

  const studentsRes = await client.query(`
    SELECT s.id, s."firstName", s."lastName", sc."displayName" as "className"
    FROM "Student" s
    LEFT JOIN "SchoolClass" sc ON s."classId" = sc.id
    WHERE s."schoolId" = $1 AND s.status = 'active'
    ORDER BY s."createdAt" ASC
    LIMIT 15
  `, [schoolId]);
  console.log("Students found:", studentsRes.rows.length);

  if (studentsRes.rows.length === 0) { console.error("No students"); process.exit(1); }

  const subjectNames = ["Mathematics", "English Language", "Civic Education", "Economics", "Government"];
  const finalScores = [78, 72, 85, 68, 81];
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

  let gradesCreated = 0;
  let reportsCreated = 0;

  for (let i = 0; i < studentsRes.rows.length; i++) {
    const s = studentsRes.rows[i];

    // Seed grades
    const existingGrades = await client.query(`SELECT id FROM "Grade" WHERE "studentId" = $1`, [s.id]);
    if (existingGrades.rows.length === 0) {
      for (let j = 0; j < subjectNames.length; j++) {
        const subjectId = subjectMap.get(subjectNames[j]);
        if (!subjectId) continue;
        const finalScore = finalScores[j];
        const ca1 = Math.round(finalScore * 0.15);
        const ca2 = Math.round(finalScore * 0.15);
        const ca3 = Math.round(finalScore * 0.10);
        const exam = finalScore - ca1 - ca2 - ca3;
        const gradeEntry = GRADE_SCALE.find((g) => finalScore >= g.min && finalScore <= g.max) || GRADE_SCALE[GRADE_SCALE.length - 1];
        const gradeComment = finalScore >= 70 ? "Excellent" : finalScore >= 50 ? "Good" : "Needs improvement";
        for (const [type, score] of [["ca1", ca1], ["ca2", ca2], ["ca3", ca3], ["exam", exam]]) {
          await client.query(
            `INSERT INTO "Grade" ("id", "studentId", "subjectId", "type", "score", "grade", "term", "session", "comments", "createdAt", "updatedAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
            [s.id, subjectId, type, score, type === "exam" ? gradeEntry.grade : null, term.name, term.yearName, type === "exam" ? gradeComment : null]
          );
          gradesCreated++;
        }
      }
      console.log(`  Grades: ${s.firstName} ${s.lastName} (4 types x ${subjectNames.length} subjects)`);
    }

    // Delete existing ReportCard (recreate with fresh data)
    await client.query(`DELETE FROM "ReportCard" WHERE "studentId" = $1 AND "termId" = $2`, [s.id, term.id]);

    const attRes = await client.query(`SELECT status FROM "AttendanceRecord" WHERE "studentId" = $1`, [s.id]);
    const totalDays = Math.max(attRes.rows.length, 120);
    const present = Math.max(attRes.rows.filter((r: any) => r.status === "present").length, 110);

    await client.query(
      `INSERT INTO "ReportCard" ("id", "studentId", "termId", "academicYear", "attendanceSummary", "behaviour", "psychomotor", "affective", "teacherComment", "principalComment", "feesSummary", "generatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        s.id, term.id, term.yearName,
        JSON.stringify({ totalDays, present, absent: totalDays - present }),
        "Excellent",
        JSON.stringify({ Sports: "Good", Handwriting: "Very Good", Creativity: "Excellent" }),
        JSON.stringify({ "Self-Control": "Good", Respect: "Excellent", Honesty: "Very Good" }),
        comments[i % comments.length],
        principalComments[i % principalComments.length],
        JSON.stringify({ tuition: 150000, development: 25000, science: 15000, sports: 10000, total: 200000, paid: 200000, balance: 0 }),
      ]
    );
    reportsCreated++;
    console.log(`  ReportCard: ${s.firstName} ${s.lastName} (${s.className})`);
  }

  console.log(`\nDone! Grades: ${gradesCreated}, ReportCards: ${reportsCreated}`);
  console.log("\nStudents to preview:");
  for (const s of studentsRes.rows.slice(0, 5)) {
    console.log(`  - ${s.firstName} ${s.lastName} (${s.className}) ID: ${s.id}`);
  }
  console.log(`Term ID: ${term.id}`);
}

main().catch(console.error).finally(() => client.end());
