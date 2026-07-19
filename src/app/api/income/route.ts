import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, amount, categoryId, date, reference, notes } = body;

    if (!title || !amount) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const schoolId = await getDefaultSchoolId();
    const income = await prisma.income.create({
      data: {
        schoolId,
        title,
        amount: parseFloat(amount),
        categoryId: categoryId || undefined,
        date: date ? new Date(date) : new Date(),
        reference: reference || undefined,
        notes: notes || undefined,
        recordedBy: session.user.name || undefined,
      },
    });

    return NextResponse.json({ success: true, income }, { status: 201 });
  } catch (error) {
    console.error("POST /api/income error:", error);
    return NextResponse.json({ error: "Failed to create income" }, { status: 500 });
  }
}
