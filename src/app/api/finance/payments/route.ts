import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { PaymentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const method = searchParams.get("method") || "";
    const studentId = searchParams.get("studentId") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { receiptNumber: { contains: search, mode: "insensitive" } },
        { student: { firstName: { contains: search, mode: "insensitive" } } },
        { student: { lastName: { contains: search, mode: "insensitive" } } },
        { student: { admissionNumber: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (method) where.method = method;
    if (studentId) where.studentId = studentId;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true,
            },
          },
          invoice: {
            select: { id: true, invoiceNumber: true, schoolFee: { select: { name: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/finance/payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = PaymentSchema.parse(body);

    const reference = validated.reference || `PAY/${Date.now()}/${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        studentId: validated.studentId,
        invoiceId: validated.invoiceId || undefined,
        amount: validated.amount,
        method: validated.method,
        reference,
        description: validated.description,
        status: "completed",
        paidAt: new Date(),
      },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNumber: true },
        },
        invoice: {
          select: { invoiceNumber: true, totalAmount: true },
        },
      },
    });

    if (validated.invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: validated.invoiceId },
        include: { payments: true },
      });

      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + validated.amount;
        await prisma.invoice.update({
          where: { id: validated.invoiceId },
          data: {
            status: totalPaid >= invoice.totalAmount ? "paid" : "partial",
          },
        });
      }
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    console.error("POST /api/finance/payments error:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
