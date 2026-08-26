import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { SCHOOL_CONFIG } from "@/lib/school-config";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          include: {
            guardians: true,
            class: true,
          },
        },
        schoolFee: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const studentName = `${invoice.student.firstName} ${invoice.student.lastName}`;
    const parentGuardian = invoice.student.guardians.find((g) => g.isPrimary) || invoice.student.guardians[0];
    const recipientEmail = parentGuardian?.email || invoice.student.email;

    if (!recipientEmail) {
      return NextResponse.json({ error: "No email address found for this student or guardian" }, { status: 400 });
    }

    const recipientName = parentGuardian
      ? `${parentGuardian.firstName} ${parentGuardian.lastName}`
      : studentName;

    const formattedAmount = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(invoice.totalAmount || invoice.amount);

    const daysLeft = Math.ceil(
      (new Date(invoice.dueDate).getTime() - Date.now()) / 86400000
    );

    const isOverdue = daysLeft < 0;
    const statusText = isOverdue
      ? `overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""}`
      : daysLeft === 0
      ? "due today"
      : `due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, ${isOverdue ? "#dc2626" : "#d97706"} 0%, ${isOverdue ? "#ef4444" : "#f59e0b"} 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px; }
          .content h2 { color: #1e293b; margin: 0 0 16px; font-size: 20px; }
          .content p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
          .invoice-box { background: ${isOverdue ? "#fef2f2" : "#fffbeb"}; border: 2px solid ${isOverdue ? "#dc2626" : "#f59e0b"}; border-radius: 8px; padding: 24px; text-align: center; margin: 16px 0; }
          .invoice-box .amount { font-size: 32px; font-weight: 700; color: ${isOverdue ? "#dc2626" : "#d97706"}; margin: 0; }
          .invoice-box .label { color: ${isOverdue ? "#7f1d1d" : "#78350f"}; font-size: 14px; margin: 4px 0 0; }
          .details { margin: 20px 0; }
          .details table { width: 100%; border-collapse: collapse; }
          .details td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
          .details td:first-child { color: #64748b; font-size: 14px; }
          .details td:last-child { color: #1e293b; font-weight: 500; text-align: right; }
          .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            <p>This is a friendly reminder that the school fee invoice for <strong>${studentName}</strong> is ${statusText}.</p>
            <div class="invoice-box">
              <p class="amount">${formattedAmount}</p>
              <p class="label">Amount ${isOverdue ? "Overdue" : "Due"}</p>
            </div>
            <div class="details">
              <table>
                <tr><td>Student Name</td><td>${studentName}</td></tr>
                <tr><td>Invoice Number</td><td>${invoice.invoiceNumber}</td></tr>
                <tr><td>Fee Type</td><td>${invoice.schoolFee.name}</td></tr>
                <tr><td>Amount</td><td>${formattedAmount}</td></tr>
                <tr><td>Due Date</td><td>${new Date(invoice.dueDate).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
                <tr><td>Status</td><td style="color: ${isOverdue ? "#dc2626" : "#d97706"}; font-weight: 600;">${isOverdue ? "Overdue" : "Pending"}</td></tr>
              </table>
            </div>
            <p>Please make payment as soon as possible to avoid further delays. If you have already made payment, kindly disregard this notice.</p>
            <p>For questions about this invoice, please contact the school finance office.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${SCHOOL_CONFIG.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const parentName = parentGuardian
      ? `${parentGuardian.firstName} ${parentGuardian.lastName}`
      : "Parent/Guardian";

    await sendEmail(
      recipientName,
      `Payment Reminder - ${invoice.invoiceNumber} (${formattedAmount})`,
      html
    );

    return NextResponse.json({
      success: true,
      message: `Reminder sent to ${recipientName} (${recipientEmail})`,
    });
  } catch (error: any) {
    console.error("Failed to send reminder:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send reminder" },
      { status: 500 }
    );
  }
}
