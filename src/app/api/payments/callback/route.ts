import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceipt } from "@/lib/resend";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const secret = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!secret) {
      console.error("FLUTTERWAVE_SECRET_HASH is not configured — rejecting webhook");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const signature = request.headers.get("verif-hash");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");
    if (signature !== expectedSig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (body.event === "charge.completed" && body.data?.status === "successful") {
      const ref = body.data.tx_ref;
      const webhookAmount = body.data.amount;

      const existingPayment = await prisma.payment.findFirst({
        where: { reference: ref },
      });

      if (existingPayment && existingPayment.status === "completed") {
        return NextResponse.json({ success: true, message: "Payment already processed" });
      }

      if (!existingPayment) {
        console.error(`No payment record found for reference: ${ref}`);
        return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
      }

      if (Math.abs(webhookAmount - existingPayment.amount) > 0.01) {
        console.error(
          `Amount mismatch for reference ${ref}: expected ${existingPayment.amount}, got ${webhookAmount}`
        );
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "completed",
          paidAt: new Date(),
          receiptNumber: `RCT-${Date.now()}`,
          flutterwaveRef: body.data.flw_ref ?? null,
          metadata: {
            ...(typeof existingPayment.metadata === "object" && existingPayment.metadata !== null
              ? existingPayment.metadata
              : {}),
            webhook: {
              txId: body.data.id,
              amount: body.data.amount,
              currency: body.data.currency,
              chargedAmount: body.data.charged_amount,
            },
          },
        },
      });

      if (updatedPayment.invoiceId) {
        await prisma.invoice.update({
          where: { id: updatedPayment.invoiceId },
          data: { status: "paid" },
        });
      }

      try {
        const student = await prisma.student.findUnique({
          where: { id: updatedPayment.studentId },
          select: { firstName: true, lastName: true, email: true, id: true },
        });
        if (student?.email) {
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
        for (const gEmail of guardianEmails) {
          await sendPaymentReceipt(
            `${student!.firstName} ${student!.lastName}`,
            gEmail,
            updatedPayment.amount,
            updatedPayment.reference
          );
        }
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
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
      return NextResponse.json(
        { error: "Missing transaction_id or tx_ref" },
        { status: 400 }
      );
    }

    const secret = process.env.FLW_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const verifyUrl = txRef
      ? `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${txRef}`
      : `https://api.flutterwave.com/v3/transactions/verify?id=${transactionId}`;

    const response = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();

    if (result.status === "success" && result.data?.status === "successful") {
      const ref = result.data.tx_ref || txRef;
      const verifyAmount = result.data.amount;

      const existingPayment = await prisma.payment.findFirst({
        where: { reference: ref },
      });

      if (existingPayment && existingPayment.status === "completed") {
        return NextResponse.redirect(
          new URL("/dashboard/finance?payment=success", request.url)
        );
      }

      if (!existingPayment) {
        console.error(`No payment record found for reference: ${ref}`);
        return NextResponse.redirect(
          new URL("/dashboard/finance?payment=error", request.url)
        );
      }

      if (Math.abs(verifyAmount - existingPayment.amount) > 0.01) {
        console.error(
          `Amount mismatch for reference ${ref}: expected ${existingPayment.amount}, got ${verifyAmount}`
        );
        return NextResponse.redirect(
          new URL("/dashboard/finance?payment=error", request.url)
        );
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "completed",
          paidAt: new Date(),
          receiptNumber: `RCT-${Date.now()}`,
          flutterwaveRef: result.data.flw_ref ?? null,
        },
      });

      if (updatedPayment.invoiceId) {
        await prisma.invoice.update({
          where: { id: updatedPayment.invoiceId },
          data: { status: "paid" },
        });
      }

      try {
        const student = await prisma.student.findUnique({
          where: { id: updatedPayment.studentId },
          select: { firstName: true, lastName: true, email: true, id: true },
        });
        if (student?.email) {
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
        for (const gEmail of guardianEmails) {
          await sendPaymentReceipt(
            `${student!.firstName} ${student!.lastName}`,
            gEmail,
            updatedPayment.amount,
            updatedPayment.reference
          );
        }
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
      }
    }

    return NextResponse.redirect(new URL("/dashboard/finance?payment=success", request.url));
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/finance?payment=error", request.url)
    );
  }
}
