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

    const ref =
      paymentData.tx_ref ||
      (typeof paymentData.meta === "object" &&
      paymentData.meta !== null &&
      "reference" in paymentData.meta
        ? (paymentData.meta as { reference: string }).reference
        : undefined);

    if (!ref) {
      return NextResponse.json(
        { error: "Could not determine payment reference" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: { reference: ref },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    if (payment.status === "completed") {
      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        reference: payment.reference,
        message: "Payment already processed",
      });
    }

    const isSuccessful = paymentData.status === "successful";

    if (isSuccessful && Math.abs(paymentData.amount - payment.amount) > 0.01) {
      console.error(
        `Amount mismatch for reference ${ref}: expected ${payment.amount}, got ${paymentData.amount}`
      );
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

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

    if (isSuccessful && updatedPayment.invoiceId) {
      await prisma.invoice.update({
        where: { id: updatedPayment.invoiceId },
        data: { status: "paid" },
      });
    }

    if (isSuccessful) {
      try {
        const student = await prisma.student.findUnique({
          where: { id: updatedPayment.studentId },
          select: { firstName: true, lastName: true, email: true, id: true },
        });
        if (student?.email) {
          const { sendPaymentReceipt } = await import("@/lib/resend");
          await sendPaymentReceipt(
            `${student.firstName} ${student.lastName}`,
            student.email,
            updatedPayment.amount,
            updatedPayment.reference
          );
        }
        const guardians = await prisma.guardian.findMany({
          where: { studentId: student!.id, email: { not: null } },
          select: { email: true },
        });
        const guardianEmails = guardians.map(g => g.email).filter(Boolean) as string[];
        if (guardianEmails.length > 0) {
          const { sendPaymentReceipt } = await import("@/lib/resend");
          for (const gEmail of guardianEmails) {
            await sendPaymentReceipt(
              `${student!.firstName} ${student!.lastName}`,
              gEmail,
              updatedPayment.amount,
              updatedPayment.reference
            );
          }
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
