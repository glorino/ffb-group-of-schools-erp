import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceipt } from "@/lib/resend";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify Flutterwave webhook signature
    const secret = process.env.FLUTTERWAVE_SECRET_HASH;
    if (secret) {
      const signature = request.headers.get("verif-hash");
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }
      const expectedSig = crypto.createHmac("sha256", secret).update(JSON.stringify(body)).digest("hex");
      if (signature !== expectedSig) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    if (body.event === "charge.completed" && body.data?.status === "successful") {
      const ref = body.data.tx_ref;
      const payment = await prisma.payment.findFirst({
        where: { reference: ref },
        include: { student: true },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "completed", paidAt: new Date(), receiptNumber: `RCT-${Date.now()}` },
        });

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

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
      const payment = await prisma.payment.findFirst({
        where: { reference: ref },
        include: { student: true },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "completed", paidAt: new Date(), receiptNumber: `RCT-${Date.now()}` },
        });

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

    return NextResponse.redirect(new URL("/dashboard/finance?payment=success", request.url));
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(new URL("/dashboard/finance?payment=error", request.url));
  }
}
