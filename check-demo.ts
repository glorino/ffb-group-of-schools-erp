import 'dotenv/config';
import pg from 'pg';
async function main() {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  
  const termRes = await c.query(`
    SELECT t.id, t.name, ay.name as "yearName"
    FROM "Term" t JOIN "AcademicYear" ay ON t."academicYearId" = ay.id
    WHERE t."isCurrent" = true LIMIT 1
  `);
  const term = termRes.rows[0];
  console.log(`Term: ${term.name} (${term.yearName}) | Term ID: ${term.id}\n`);

  const students = await c.query(`
    SELECT s.id, s."firstName", s."lastName", sc."displayName" as "className",
      (SELECT COUNT(*) FROM "Grade" g WHERE g."studentId" = s.id) as "gradeCount",
      (SELECT EXISTS (SELECT 1 FROM "ReportCard" rc WHERE rc."studentId" = s.id AND rc."termId" = $1)) as "hasRC"
    FROM "Student" s LEFT JOIN "SchoolClass" sc ON s."classId" = sc.id
    WHERE s.status = 'active' ORDER BY s."createdAt" ASC
  `, [term.id]);
  
  for (const s of students.rows) {
    console.log(`${s.firstName} ${s.lastName} | ${s.className} | Grades: ${s.gradeCount} | RC: ${s.hasRC} | ID: ${s.id}`);
  }
  await c.end();
}
main().catch(console.error);
