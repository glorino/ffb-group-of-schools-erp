import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        documents: true,
        exams: true,
        student: true,
        school: true,
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(applicant);
  } catch (error) {
    console.error("GET /api/admissions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.applicant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const newStatus = body.status ?? existing.status;

    let assignedClassId = existing.assignedClassId;
    let assignedArm = existing.assignedArm;

    if (newStatus === "admitted" && !existing.assignedClassId) {
      const classMatch = await prisma.schoolClass.findFirst({
        where: {
          schoolId: existing.schoolId,
          name: { contains: existing.classAppliedFor, mode: "insensitive" },
        },
        orderBy: { name: "asc" },
      });

      if (classMatch) {
        const studentCount = await prisma.student.count({
          where: { classId: classMatch.id, status: "active" },
        });

        if (studentCount < classMatch.capacity) {
          assignedClassId = classMatch.id;
          assignedArm = classMatch.section || classMatch.name;
        } else {
          const nextArm = await prisma.schoolClass.findFirst({
            where: {
              schoolId: existing.schoolId,
              name: { contains: existing.classAppliedFor.replace(/\d+$/, "").trim(), mode: "insensitive" },
              NOT: { id: classMatch.id },
            },
            orderBy: { name: "asc" },
          });

          if (nextArm) {
            const nextCount = await prisma.student.count({
              where: { classId: nextArm.id, status: "active" },
            });
            if (nextCount < nextArm.capacity) {
              assignedClassId = nextArm.id;
              assignedArm = nextArm.section || nextArm.name;
            }
          }
        }
      }
    }

    const applicant = await prisma.applicant.update({
      where: { id },
      data: {
        status: newStatus,
        decision: body.decision ?? existing.decision,
        decisionNote: body.decisionNote ?? existing.decisionNote,
        rejectionReason: body.rejectionReason ?? existing.rejectionReason,
        examDate: body.examDate ? new Date(body.examDate) : existing.examDate,
        interviewDate: body.interviewDate ? new Date(body.interviewDate) : existing.interviewDate,
        reviewedAt: newStatus !== "pending" ? new Date() : existing.reviewedAt,
        reviewedBy: session.user.email || session.user.name || null,
        assignedClassId,
        assignedArm,
      },
      include: {
        documents: true,
        exams: true,
        student: true,
      },
    });

    if (newStatus === "admitted" && existing.email) {
      try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "FFB Schools <admissions@glopresc.com>",
              to: [existing.email],
              subject: `Admission Offer - FFB Group of Schools (${existing.applicationNumber})`,
              html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #fff; border-radius: 16px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #0039a6, #0055ff); padding: 40px 30px; text-align: center;">
                    <h1 style="font-size: 28px; font-weight: 800; margin: 0;">Congratulations! 🎉</h1>
                    <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">You have been admitted to FFB Group of Schools</p>
                  </div>
                  <div style="padding: 30px;">
                    <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 20px;">
                      Dear ${existing.firstName} ${existing.lastName},
                    </p>
                    <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 20px;">
                      We are pleased to inform you that your application (<strong>${existing.applicationNumber}</strong>) has been approved and you have been admitted into <strong>${existing.classAppliedFor}</strong> at FFB Group of Schools for the ${new Date().getFullYear()}/${new Date().getFullYear() + 1} academic session.
                    </p>
                    <div style="background: rgba(40,255,156,0.08); border: 1px solid rgba(40,255,156,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
                      <p style="color: #28ff9c; font-weight: 700; margin-bottom: 8px;">Next Steps:</p>
                      <ul style="color: rgba(255,255,255,0.7); line-height: 1.8; padding-left: 20px;">
                        <li>Pay the admission acceptance fee</li>
                        <li>Visit the school for document verification</li>
                        <li>Complete registration and pay tuition fees</li>
                        <li>Attend the orientation programme</li>
                      </ul>
                    </div>
                    ${body.decisionNote ? `<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 20px;"><strong>Note from admissions:</strong> ${body.decisionNote}</p>` : ""}
                    <p style="color: rgba(255,255,255,0.5); line-height: 1.7; margin-top: 25px;">
                      For enquiries, contact us at <a href="mailto:info@glopresc.com" style="color: #28ff9c;">info@glopresc.com</a> or call <strong>+234 905 998 0991</strong>.
                    </p>
                    <p style="color: rgba(255,255,255,0.5); margin-top: 20px;">Warm regards,<br/><strong>FFB Admissions Team</strong></p>
                  </div>
                </div>
              `,
            }),
          });
          console.log(`Admission email sent to ${existing.email}`);
        }
      } catch (emailError) {
        console.error("Failed to send admission email:", emailError);
      }
    }

    if (newStatus === "rejected" && existing.email) {
      try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "FFB Schools <admissions@glopresc.com>",
              to: [existing.email],
              subject: `Application Update - FFB Group of Schools (${existing.applicationNumber})`,
              html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #fff; border-radius: 16px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 40px 30px; text-align: center;">
                    <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Application Update</h1>
                  </div>
                  <div style="padding: 30px;">
                    <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">
                      Dear ${existing.firstName} ${existing.lastName},
                    </p>
                    <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-top: 15px;">
                      Thank you for your interest in FFB Group of Schools. After careful review, we regret to inform you that we are unable to offer admission at this time for application <strong>${existing.applicationNumber}</strong>.
                    </p>
                    ${body.rejectionReason ? `<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 15px;"><strong>Reason:</strong> ${body.rejectionReason}</p>` : ""}
                    <p style="color: rgba(255,255,255,0.5); line-height: 1.7; margin-top: 20px;">
                      We encourage you to apply again in the future. For any queries, contact us at <a href="mailto:info@glopresc.com" style="color: #3b82f6;">info@glopresc.com</a>.
                    </p>
                    <p style="color: rgba(255,255,255,0.5); margin-top: 20px;">Warm regards,<br/><strong>FFB Admissions Team</strong></p>
                  </div>
                </div>
              `,
            }),
          });
        }
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
    }

    return NextResponse.json(applicant);
  } catch (error) {
    console.error("PUT /api/admissions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.applicant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await prisma.applicant.delete({ where: { id } });

    return NextResponse.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admissions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
