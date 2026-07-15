import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function check() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const counts = await Promise.all([
    prisma.school.count(),
    prisma.role.count(),
    prisma.user.count(),
    prisma.student.count(),
    prisma.subject.count(),
    prisma.schoolClass.count(),
    prisma.term.count(),
  ]);

  console.log("Schools:", counts[0]);
  console.log("Roles:", counts[1]);
  console.log("Users:", counts[2]);
  console.log("Students:", counts[3]);
  console.log("Subjects:", counts[4]);
  console.log("Classes:", counts[5]);
  console.log("Terms:", counts[6]);

  await prisma.$disconnect();
}

check();
