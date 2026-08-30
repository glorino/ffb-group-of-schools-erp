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

    try {
      await prisma.$queryRaw`SELECT 1 FROM "Applicant" LIMIT 1`;
      return NextResponse.json({ success: true, message: "Applicant table exists" });
    } catch {
      return NextResponse.json({
        success: false,
        message: "Applicant table not found. Please run 'npx prisma db push' on the server."
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error("POST /api/seed/schema error:", error);
    return NextResponse.json({ error: error.message || "Failed to check schema" }, { status: 500 });
  }
}
