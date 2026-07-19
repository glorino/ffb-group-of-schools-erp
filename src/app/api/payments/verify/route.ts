import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { verifyPayment } from "@/lib/flutterwave";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId } = body as { transactionId?: string };

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId is required" },
        { status: 400 }
      );
    }

    const verification = await verifyPayment(transactionId);

    const paymentData = verification.data;
    const reference =
      typeof paymentData.meta === "object" &&
      paymentData.meta !== null &&
      "reference" in paymentData.meta
        ? (paymentData.meta as { reference: string }).reference
        : undefined;

    const payment = await prisma.payment.findFirst({
      where: {
        ...(reference ? { reference } : {}),
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    const isSuccessful = paymentData.status === "successful";

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccessful ? "completed" : "failed",
        flutterwaveRef: paymentData.flw_ref,
        paidAt: isSuccessful ? new Date(paymentData.created_at) : undefined,
        metadata: {
          ...(typeof payment.metadata === "object" && payment.metadata !== null
            ? payment.metadata
            : {}),
          verification: {
            txId: paymentData.id,
            amount: paymentData.amount,
            currency: paymentData.currency,
            chargedAmount: paymentData.charged_amount,
            status: paymentData.status,
          },
        },
      },
    });

    if (isSuccessful && payment.invoiceId) {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "paid" },
      });
    }

    // Send receipt email on successful payment
    if (isSuccessful) {
      try {
        const paymentWithStudent = await prisma.payment.findUnique({
          where: { id: payment.id },
          include: { student: true },
        });
        if (paymentWithStudent?.student?.email) {
          const { sendPaymentReceipt } = await import("@/lib/resend");
          await sendPaymentReceipt(
            `${paymentWithStudent.student.firstName} ${paymentWithStudent.student.lastName}`,
            paymentWithStudent.student.email || "",
            paymentWithStudent.amount,
            paymentWithStudent.reference
          );
        }
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
      }
    }

    return NextResponse.json({
      success: isSuccessful,
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      amount: paymentData.amount,
      reference: updatedPayment.reference,
    });
  } catch (error) {
    console.error("POST /api/payments/verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
