import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();
    const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
    if (!session?.user || (!userRoles.includes("OWNER") && !userRoles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const created: string[] = [];

    try {
      await prisma.$queryRaw`SELECT 1 FROM "Applicant" LIMIT 1`;
    } catch {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Applicant" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "schoolId" TEXT NOT NULL,
          "applicationNumber" TEXT NOT NULL,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "middleName" TEXT,
          "email" TEXT NOT NULL DEFAULT '',
          "phone" TEXT NOT NULL DEFAULT '',
          "dateOfBirth" TIMESTAMP(3) NOT NULL,
          "gender" TEXT NOT NULL,
          "classAppliedFor" TEXT NOT NULL,
          "previousSchool" TEXT,
          "photo" TEXT,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "reviewedAt" TIMESTAMP(3),
          "reviewedBy" TEXT,
          "examDate" TIMESTAMP(3),
          "interviewDate" TIMESTAMP(3),
          "decision" TEXT,
          "decisionNote" TEXT,
          "rejectionReason" TEXT,
          "guardianName" TEXT,
          "guardianPhone" TEXT,
          "guardianEmail" TEXT,
          "guardianRelationship" TEXT,
          "address" TEXT,
          "nationality" TEXT,
          "stateOfOrigin" TEXT,
          "bloodGroup" TEXT,
          "assignedClassId" TEXT,
          "assignedArm" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Applicant_applicationNumber_key" ON "Applicant"("applicationNumber");
        CREATE INDEX IF NOT EXISTS "Applicant_schoolId_idx" ON "Applicant"("schoolId");
        CREATE INDEX IF NOT EXISTS "Applicant_status_idx" ON "Applicant"("status");
      `);
      created.push("Applicant");
    }

    try {
      await prisma.$queryRaw`SELECT 1 FROM "ApplicantDocument" LIMIT 1`;
    } catch {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ApplicantDocument" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "applicantId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "size" INTEGER,
          "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ApplicantDocument_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      created.push("ApplicantDocument");
    }

    try {
      await prisma.$queryRaw`SELECT 1 FROM "ApplicantExam" LIMIT 1`;
    } catch {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ApplicantExam" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "applicantId" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "score" DOUBLE PRECISION,
          "maxScore" DOUBLE PRECISION,
          "remarks" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ApplicantExam_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      created.push("ApplicantExam");
    }

    if (created.length > 0) {
      return NextResponse.json({ success: true, message: `Created tables: ${created.join(", ")}` });
    }
    return NextResponse.json({ success: true, message: "All admission tables already exist" });
  } catch (error: any) {
    console.error("POST /api/seed/schema error:", error);
    return NextResponse.json({ error: error.message || "Failed to push schema" }, { status: 500 });
  }
}
