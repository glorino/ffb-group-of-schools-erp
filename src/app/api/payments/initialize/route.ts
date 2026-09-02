import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { initializePayment } from "@/lib/flutterwave";
import { requireAuth } from "@/lib/api-rbac";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "PARENT"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { studentId, amount, email, name, invoiceId } = body as {
      studentId?: string;
      amount?: number;
      email?: string;
      name?: string;
      invoiceId?: string;
    };

    if (!studentId || !email || !name) {
      return NextResponse.json(
        { error: "studentId, email, and name are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, admissionNumber: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    let validatedAmount: number;
    let resolvedInvoiceId: string | null = null;

    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { id: true, totalAmount: true, studentId: true, status: true },
      });

      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      if (invoice.studentId !== studentId) {
        return NextResponse.json(
          { error: "Invoice does not belong to this student" },
          { status: 400 }
        );
      }

      if (invoice.status === "paid") {
        return NextResponse.json(
          { error: "Invoice is already fully paid" },
          { status: 400 }
        );
      }

      validatedAmount = invoice.totalAmount;
      resolvedInvoiceId = invoice.id;
    } else if (amount && amount > 0) {
      validatedAmount = amount;
    } else {
      return NextResponse.json(
        { error: "amount is required when no invoiceId is provided" },
        { status: 400 }
      );
    }

    if (validatedAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    const reference = `FFB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        studentId,
        invoiceId: resolvedInvoiceId,
        amount: validatedAmount,
        method: "flutterwave",
        reference,
        status: "pending",
        description: `Payment for ${student.firstName} ${student.lastName}`,
      },
    });

    const paymentResponse = await initializePayment({
      amount: validatedAmount,
      email,
      name,
      metadata: {
        studentId,
        paymentId: payment.id,
        reference,
        ...(resolvedInvoiceId ? { invoiceId: resolvedInvoiceId } : {}),
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      reference,
      paymentLink: paymentResponse.data.link,
    });
  } catch (error) {
    console.error("POST /api/payments/initialize error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
