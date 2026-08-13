import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";
import { IncomeSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"]);
    if (authResult.error) return authResult.error;

    const incomes = await prisma.income.findMany({
      include: { category: true },
      orderBy: { date: "desc" },
    });

    const categories = await prisma.incomeCategory.findMany();
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    return NextResponse.json({ incomes, categories, stats: { totalIncome, count: incomes.length } });
  } catch (error) {
    console.error("GET /api/income error:", error);
    return NextResponse.json({ error: "Failed to fetch income" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;

    const body = await request.json();
    const validated = IncomeSchema.parse(body);
    const { title, amount, date } = validated;

    const schoolId = await getDefaultSchoolId();
    const income = await prisma.income.create({
      data: {
        schoolId,
        title,
        amount,
        date: date ? new Date(date) : new Date(),
        categoryId: validated.category,
        notes: validated.description || undefined,
        recordedBy: session?.user?.name || undefined,
      },
    });

    return NextResponse.json({ success: true, income }, { status: 201 });
  } catch (error) {
    console.error("POST /api/income error:", error);
    return NextResponse.json({ error: "Failed to create income" }, { status: 500 });
  }
}
