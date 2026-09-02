import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { sendEmail } from "@/lib/resend";
import { SCHOOL_CONFIG } from "@/lib/school-config";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { classId, termId } = body;

    if (!classId || !termId) {
      return NextResponse.json(
        { error: "classId and termId are required" },
        { status: 400 }
      );
    }

    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: { academicYear: true },
    });

    const students = await prisma.student.findMany({
      where: { classId, status: "active" },
      include: {
        guardians: { select: { email: true, firstName: true } },
      },
    });

    const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
    const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
    let notified = 0;

    for (const student of students) {
      const guardianEmails = student.guardians
        .map(g => g.email)
        .filter((e): e is string => Boolean(e));

      if (guardianEmails.length === 0) continue;

      try {
        await sendEmail(
          guardianEmails,
          `Report Card Ready - ${schoolName}`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #fff; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
              <h1 style="font-size: 22px; font-weight: 700; margin: 0;">Report Card Available</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">Dear Parent/Guardian,</p>
              <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-top: 15px;">
                The report card for <strong>${student.firstName} ${student.lastName}</strong> (${student.admissionNumber}) is now available for the <strong>${term?.name || "current"} ${term?.academicYear?.name || ""}</strong> academic term.
              </p>
              <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-top: 15px;">
                Please log in to the school portal to view and download the report card.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || "https://ffb-erp.vercel.app"}/dashboard/report-cards" style="background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block;">View Report Card</a>
              </div>
              <p style="color: rgba(255,255,255,0.5); margin-top: 20px;">Warm regards,<br/><strong>${schoolName} Administration</strong></p>
            </div>
          </div>`
        );
        notified++;
      } catch (emailError) {
        console.error(`Failed to send report card email to guardians of ${student.firstName}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notified ${notified} parent(s) across ${students.length} student(s)`,
      studentsCount: students.length,
      notifiedCount: notified,
    });
  } catch (error) {
    console.error("POST /api/reports/notify-parents error:", error);
    return NextResponse.json(
      { error: "Failed to notify parents" },
      { status: 500 }
    );
  }
}
