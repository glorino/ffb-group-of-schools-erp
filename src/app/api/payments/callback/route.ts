import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceipt } from "@/lib/resend";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transaction_id");
    const txRef = searchParams.get("tx_ref");

    if (!transactionId && !txRef) {
      return NextResponse.json({ error: "Missing transaction_id or tx_ref" }, { status: 400 });
    }

    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const verifyUrl = txRef
      ? `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${txRef}`
      : `https://api.flutterwave.com/v3/transactions/verify?id=${transactionId}`;

    const response = await fetch(verifyUrl, {
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    });
    const result = await response.json();

    if (result.status === "success" && result.data?.status === "successful") {
      const ref = result.data.tx_ref || txRef;

      // Update payment status
      const payment = await prisma.payment.findFirst({
        where: { reference: ref },
        include: { student: true },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "completed", paidAt: new Date(), receiptNumber: `RCT-${Date.now()}` },
        });

        // Send receipt email
        try {
          await sendPaymentReceipt(
            `${payment.student.firstName} ${payment.student.lastName}`,
            payment.student.email || "",
            payment.amount,
            payment.reference
          );
        } catch (emailError) {
          console.error("Failed to send receipt email:", emailError);
        }
      }
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard/finance?payment=success", request.url));
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(new URL("/dashboard/finance?payment=error", request.url));
  }
}
