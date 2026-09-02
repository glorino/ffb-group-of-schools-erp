import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { sendEmail } from "@/lib/resend";
import { SCHOOL_CONFIG } from "@/lib/school-config";

function buildPayslipHtml(params: {
  teacherName: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  payDate: string;
}) {
  const { teacherName, employeeId, month, year, basicSalary, allowances, deductions, bonus, netSalary, payDate } = params;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0a2a6e,#0055ff);padding:28px 32px;color:#fff;text-align:center;">
      <h1 style="margin:0;font-size:20px;font-weight:700;">${SCHOOL_CONFIG.name}</h1>
      <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">Payslip — ${month} ${year}</p>
    </div>

    <!-- Employee Info -->
    <div style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr>
          <td style="padding:4px 0;"><strong>Employee:</strong></td>
          <td style="padding:4px 0;">${teacherName}</td>
          <td style="padding:4px 0;"><strong>Employee ID:</strong></td>
          <td style="padding:4px 0;">${employeeId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>Pay Period:</strong></td>
          <td style="padding:4px 0;">${month} ${year}</td>
          <td style="padding:4px 0;"><strong>Pay Date:</strong></td>
          <td style="padding:4px 0;">${payDate}</td>
        </tr>
      </table>
    </div>

    <!-- Salary Breakdown -->
    <div style="padding:24px 32px;">
      <h3 style="margin:0 0 16px;font-size:15px;color:#1a1a2e;">Salary Breakdown</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="text-align:left;padding:10px 12px;border-bottom:2px solid #e5e7eb;color:#64748b;">Description</th>
            <th style="text-align:right;padding:10px 12px;border-bottom:2px solid #e5e7eb;color:#64748b;">Amount (₦)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">Basic Salary</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">${basicSalary.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#059669;">Allowances</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#059669;">+${allowances.toLocaleString()}</td>
          </tr>
          ${bonus > 0 ? `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#059669;">Bonus</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#059669;">+${bonus.toLocaleString()}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#dc2626;">Deductions</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#dc2626;">-${deductions.toLocaleString()}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background:#eff6ff;">
            <td style="padding:12px;font-weight:700;font-size:14px;border-top:2px solid #0055ff;">Net Salary</td>
            <td style="padding:12px;font-weight:700;font-size:14px;text-align:right;color:#0055ff;border-top:2px solid #0055ff;">₦${netSalary.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        This is a computer-generated payslip. For queries, contact the accounts department.<br/>
        ${SCHOOL_CONFIG.name} — ${SCHOOL_CONFIG.address || 'Lagos, Nigeria'}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "ACCOUNTANT"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { payrollIds, month, year } = body;

    let payrolls;
    if (payrollIds && payrollIds.length > 0) {
      payrolls = await prisma.payroll.findMany({
        where: { id: { in: payrollIds } },
        include: { teacher: true },
      });
    } else if (month && year) {
      payrolls = await prisma.payroll.findMany({
        where: { month, year: parseInt(year) },
        include: { teacher: true },
      });
    } else {
      return NextResponse.json({ error: "Provide payrollIds or month/year" }, { status: 400 });
    }

    if (payrolls.length === 0) {
      return NextResponse.json({ error: "No payroll entries found" }, { status: 404 });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const payroll of payrolls) {
      if (!payroll.teacher?.email) {
        failed++;
        errors.push(`${payroll.teacher?.firstName} ${payroll.teacher?.lastName} — no email`);
        continue;
      }

      try {
        const html = buildPayslipHtml({
          teacherName: `${payroll.teacher.firstName} ${payroll.teacher.lastName}`,
          employeeId: payroll.teacher.employeeId,
          month: payroll.month,
          year: payroll.year,
          basicSalary: payroll.basicSalary,
          allowances: payroll.allowances || 0,
          deductions: payroll.deductions || 0,
          bonus: (payroll as any).bonus || 0,
          netSalary: payroll.netSalary,
          payDate: new Date().toLocaleDateString("en-NG"),
        });

        await sendEmail(
          payroll.teacher.email,
          `Payslip — ${payroll.month} ${payroll.year} | ${SCHOOL_CONFIG.name}`,
          html
        );

        await prisma.payroll.update({
          where: { id: payroll.id },
          data: { payslipSent: true, payslipSentAt: new Date() },
        });

        sent++;
      } catch (err: any) {
        failed++;
        errors.push(`${payroll.teacher?.firstName} ${payroll.teacher?.lastName} — ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payslips sent: ${sent} delivered, ${failed} failed`,
      sent,
      failed,
      errors,
    });
  } catch (error) {
    console.error("POST /api/payroll/send-payslips error:", error);
    return NextResponse.json({ error: "Failed to send payslips" }, { status: 500 });
  }
}
