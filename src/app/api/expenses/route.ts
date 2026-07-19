import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({ where, orderBy: { date: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.expense.count({ where }),
    ]);

    const totalAmount = await prisma.expense.aggregate({ _sum: { amount: true }, where: { status: "approved" } });
    const pendingAmount = await prisma.expense.aggregate({ _sum: { amount: true }, where: { status: "pending" } });

    return NextResponse.json({
      expenses,
      stats: {
        totalAmount: totalAmount._sum.amount || 0,
        pendingAmount: pendingAmount._sum.amount || 0,
        totalCount: total,
        pendingCount: await prisma.expense.count({ where: { status: "pending" } }),
      },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, amount, category, date, reference, vendor, notes } = body;

    if (!title || !amount || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const schoolId = await getDefaultSchoolId();
    const expense = await prisma.expense.create({
      data: {
        schoolId,
        title,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date) : new Date(),
        reference: reference || undefined,
        vendor: vendor || undefined,
        notes: notes || undefined,
        approvedBy: session.user.name || undefined,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, status: newStatus } = body;
    if (!id || !newStatus) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

    const expense = await prisma.expense.update({ where: { id }, data: { status: newStatus } });
    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("PUT /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}
