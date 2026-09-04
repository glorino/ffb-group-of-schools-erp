import 'dotenv/config';
import pg from 'pg';
import { randomUUID } from 'crypto';

async function main() {
  let c: pg.Client | null = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await c.connect();
      console.log('Connected (attempt', attempt, ')');
      break;
    } catch (e) {
      console.log(`Attempt ${attempt} failed, retrying...`);
      if (attempt === 5) throw e;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  if (!c) throw new Error('Failed to connect');

  await c.query('BEGIN');

  const termRes = await c.query(`SELECT t.id FROM "Term" t WHERE t."isCurrent" = true LIMIT 1`);
  const termId = termRes.rows[0].id;

  const studentsRes = await c.query(`SELECT s.id, s."firstName", s."lastName" FROM "Student" s WHERE s.status = 'active'`);
  console.log('Students:', studentsRes.rows.length);

  await c.query(`DELETE FROM "TermResult" WHERE "termId" = $1`, [termId]);

  const tuples: string[] = [];
  const n = studentsRes.rows.length;
  for (let i = 0; i < n; i++) {
    const s = studentsRes.rows[i];
    const avg = Math.round((85 - i * 3.5 + Math.random() * 5) * 100) / 100;
    const totalScore = Math.round(avg * 5 * 100) / 100;
    const pos = i + 1;
    const promoted = pos <= n * 0.85;
    tuples.push(`('${s.id}','${termId}','${randomUUID()}',${totalScore},${avg},${pos},${n},'${promoted ? "Passed" : "Needs Improvement"}',${promoted},NOW())`);
  }

  await c.query(`INSERT INTO "TermResult" ("studentId","termId","id","totalScore","average","position","classSize","remark","promoted","createdAt") VALUES ${tuples.join(',')}`);
  await c.query('COMMIT');
  console.log(`Created ${tuples.length} TermResults`);
  await c.end();
}
main().catch(console.error);
