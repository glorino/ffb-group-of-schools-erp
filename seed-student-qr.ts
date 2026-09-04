import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

function generateQR(): string {
  return `STU-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}

async function main() {
  const students = await prisma.student.findMany();
  let updated = 0;
  for (const student of students) {
    if (!student.qrCode) {
      await prisma.student.update({
        where: { id: student.id },
        data: { qrCode: generateQR() },
      });
      updated++;
    }
  }
  console.log(`Generated QR codes for ${updated} students (${students.length - updated} already had codes)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
