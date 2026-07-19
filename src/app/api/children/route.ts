import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const userRoles: string[] = (session.user as any)?.roles?.map((r: any) => r.name) || [];

    // Find children based on role
    if (userRoles.includes("PARENT")) {
      // Find guardian linked to this user's email
      const guardians = await prisma.guardian.findMany({
        where: { email: session.user.email || "" },
        include: {
          student: {
            include: {
              class: true,
              grades: { include: { subject: true }, orderBy: { createdAt: "desc" }, take: 20 },
              attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
              invoices: { include: { schoolFee: true, payments: true }, orderBy: { createdAt: "desc" } },
            },
          },
        },
      });

      const children = guardians.map(g => g.student);
      return NextResponse.json({ children });
    }

    if (userRoles.includes("STUDENT")) {
      // Students see their own data
      const student = await prisma.student.findFirst({
        where: { email: session.user.email || "" },
        include: {
          class: true,
          grades: { include: { subject: true }, orderBy: { createdAt: "desc" }, take: 20 },
          attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
          invoices: { include: { schoolFee: true, payments: true }, orderBy: { createdAt: "desc" } },
        },
      });

      return NextResponse.json({ children: student ? [student] : [] });
    }

    return NextResponse.json({ children: [] });
  } catch (error) {
    console.error("GET /api/children error:", error);
    return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
  }
}
