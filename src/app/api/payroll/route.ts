import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "ACCOUNTANT"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || String(new Date().getMonth() + 1);
    const year = searchParams.get("year") || String(new Date().getFullYear());

    const payrolls = await prisma.payroll.findMany({
      where: { month, year: parseInt(year) },
      include: {
        teacher: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + (p.deductions || 0), 0);
    const paidCount = payrolls.filter(p => p.status === "paid").length;
    const pendingCount = payrolls.filter(p => p.status === "pending").length;

    return NextResponse.json({
      payrolls,
      stats: { totalNet, totalDeductions, paidCount, pendingCount, total: payrolls.length },
    });
  } catch (error) {
    console.error("GET /api/payroll error:", error);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "ACCOUNTANT"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { teacherId, month, year, basicSalary, allowances, deductions } = body;

    if (!teacherId || !month || !year || !basicSalary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const netSalary = basicSalary + (allowances || 0) - (deductions || 0);

    const payroll = await prisma.payroll.upsert({
      where: { teacherId_month_year: { teacherId, month, year: parseInt(year) } },
      update: { basicSalary, allowances: allowances || 0, deductions: deductions || 0, netSalary },
      create: {
        teacherId,
        month,
        year: parseInt(year),
        basicSalary,
        allowances: allowances || 0,
        deductions: deductions || 0,
        netSalary,
      },
      include: { teacher: true },
    });

    return NextResponse.json({ success: true, payroll }, { status: 201 });
  } catch (error) {
    console.error("POST /api/payroll error:", error);
    return NextResponse.json({ error: "Failed to create payroll" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "ACCOUNTANT"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, status: newStatus } = body;

    if (!id || !newStatus) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const updateData: any = { status: newStatus };
    if (newStatus === "paid") updateData.paidAt = new Date();

    const payroll = await prisma.payroll.update({
      where: { id },
      data: updateData,
      include: { teacher: true },
    });

    if (newStatus === "paid" && payroll.teacher?.email) {
      try {
        const { sendEmail } = await import("@/lib/resend");
        await sendEmail(
          payroll.teacher.email,
          `Salary Payment - ${payroll.month}/${payroll.year}`,
          `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #0055ff;">FFB Group of Schools</h2>
            <p>Dear ${payroll.teacher.firstName} ${payroll.teacher.lastName},</p>
            <p>Your salary for ${payroll.month}/${payroll.year} has been processed.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Basic Salary:</strong> ₦${(payroll.basicSalary || 0).toLocaleString()}</p>
              <p><strong>Allowances:</strong> ₦${(payroll.allowances || 0).toLocaleString()}</p>
              <p><strong>Deductions:</strong> ₦${(payroll.deductions || 0).toLocaleString()}</p>
              <p><strong>Net Salary:</strong> ₦${(payroll.netSalary || 0).toLocaleString()}</p>
            </div>
            <p>Payment Date: ${new Date().toLocaleDateString("en-NG")}</p>
            <p>Best regards,<br/>FFB Accounts Department</p>
          </div>`
        );
      } catch (emailError) {
        console.error("Failed to send payroll email:", emailError);
      }
    }

    return NextResponse.json({ success: true, payroll });
  } catch (error) {
    console.error("PUT /api/payroll error:", error);
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 });
  }
}
