import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { DisciplineSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/resend";
import { SCHOOL_CONFIG } from "@/lib/school-config";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || "";

    const where: any = {};
    if (studentId) where.studentId = studentId;

    const records = await prisma.disciplineRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true, class: { select: { name: true } } } } },
    });

    const totalIncidents = records.length;
    const resolved = records.filter(r => r.action && r.action !== "pending").length;
    const pending = totalIncidents - resolved;

    const typeMap: Record<string, number> = {};
    records.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + 1; });
    const byType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

    const monthMap: Record<string, number> = {};
    records.forEach(r => {
      const month = new Date(r.date).toLocaleString("en-US", { month: "short" });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    const monthlyTrend = Object.entries(monthMap).map(([month, incidents]) => ({ month, incidents }));

    return NextResponse.json({ success: true, totalIncidents, resolved, pending, byType, monthlyTrend, records });
  } catch (error) {
    console.error("GET /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to fetch discipline records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = DisciplineSchema.parse(body);
    const { studentId, type, title } = validated;

    const record = await prisma.disciplineRecord.create({
      data: {
        studentId,
        type,
        title,
        details: validated.description || undefined,
        date: validated.date ? new Date(validated.date) : new Date(),
        action: validated.action || "pending",
        reportedBy: authResult.session?.user?.name || undefined,
      },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });

    try {
      const guardians = await prisma.guardian.findMany({
        where: { studentId, email: { not: null } },
        select: { email: true, firstName: true },
      });
      if (guardians.length > 0) {
        const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
        const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
        const guardianEmails = guardians.map(g => g.email).filter(Boolean) as string[];
        await sendEmail(
          guardianEmails,
          `Discipline Notice - ${schoolName}`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #fff; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center;">
              <h1 style="font-size: 22px; font-weight: 700; margin: 0;">Discipline Notice</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">Dear Parent/Guardian,</p>
              <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-top: 15px;">
                We wish to inform you that <strong>${record.student.firstName} ${record.student.lastName}</strong> has been involved in a discipline matter.
              </p>
              <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="color: rgba(255,255,255,0.7); margin: 5px 0;"><strong>Type:</strong> ${type}</p>
                <p style="color: rgba(255,255,255,0.7); margin: 5px 0;"><strong>Issue:</strong> ${title}</p>
                ${validated.description ? `<p style="color: rgba(255,255,255,0.7); margin: 5px 0;"><strong>Details:</strong> ${validated.description}</p>` : ""}
                <p style="color: rgba(255,255,255,0.7); margin: 5px 0;"><strong>Action:</strong> ${validated.action || "pending"}</p>
              </div>
              <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 20px;">
                Please contact the school if you have any questions.
              </p>
              <p style="color: rgba(255,255,255,0.5); margin-top: 20px;">Warm regards,<br/><strong>${schoolName} Administration</strong></p>
            </div>
          </div>`
        );
      }
    } catch (emailError) {
      console.error("Failed to send discipline notification:", emailError);
    }

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    console.error("POST /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to create discipline record" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, type, title, details, date, action } = body;

    if (!id) return NextResponse.json({ error: "Record ID is required" }, { status: 400 });

    const record = await prisma.disciplineRecord.update({
      where: { id },
      data: {
        type: type || undefined,
        title: title || undefined,
        details: details || undefined,
        date: date ? new Date(date) : undefined,
        action: action || undefined,
      },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("PUT /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to update discipline record" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.disciplineRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/discipline error:", error);
    return NextResponse.json({ error: "Failed to delete discipline record" }, { status: 500 });
  }
}
