import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const records = await prisma.disciplineRecord.findMany({
      orderBy: { createdAt: "desc" },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });

    const totalIncidents = records.length;
    const resolved = records.filter(r => r.action && r.action !== "pending").length;
    const pending = totalIncidents - resolved;

    const typeMap: Record<string, number> = {};
    records.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + 1; });
    const byType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

    const monthMap: Record<string, number> = {};
    records.forEach(r => {
      const month = new Date(r.date).toLocaleString("en-US", { month: "short" });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    const monthlyTrend = Object.entries(monthMap).map(([month, incidents]) => ({ month, incidents }));

    return NextResponse.json({ success: true, totalIncidents, resolved, pending, byType, monthlyTrend, records });
  } catch (error) {
    console.error("GET /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to fetch discipline records" }, { status: 500 });
  }
}
