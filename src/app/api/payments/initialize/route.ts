import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { initializePayment } from "@/lib/flutterwave";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, amount, email, name } = body as {
      studentId?: string;
      amount?: number;
      email?: string;
      name?: string;
    };

    if (!studentId || !amount || !email || !name) {
      return NextResponse.json(
        { error: "studentId, amount, email, and name are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
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

    const reference = `FFB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount,
        method: "flutterwave",
        reference,
        status: "pending",
        description: `Payment for ${student.firstName} ${student.lastName}`,
      },
    });

    const paymentResponse = await initializePayment({
      amount,
      email,
      name,
      metadata: {
        studentId,
        paymentId: payment.id,
        reference,
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
