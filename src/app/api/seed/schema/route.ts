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

    // Try to query the Applicant table to check if it exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Applicant" LIMIT 1`;
      return NextResponse.json({ success: true, message: "Applicant table exists" });
    } catch {
      // Table doesn't exist - push schema
      const { execSync } = await import("child_process");
      execSync("npx prisma db push --skip-generate", { 
        cwd: process.cwd(), 
        timeout: 60000,
        stdio: "pipe"
      });
      return NextResponse.json({ success: true, message: "Schema pushed successfully. Applicant table created." });
    }
  } catch (error: any) {
    console.error("POST /api/seed/schema error:", error);
    return NextResponse.json({ error: error.message || "Failed to push schema" }, { status: 500 });
  }
}
