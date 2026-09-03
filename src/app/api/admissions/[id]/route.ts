import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SCHOOL_CONFIG } from "@/lib/school-config";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";
import { sendApplicationStatusUpdateEmail } from "@/lib/resend";
import { generateAdmissionNumber } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["OWNER", "SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { id } = await params;

    let applicant: any = null;
    try {
      applicant = await prisma.applicant.findUnique({
        where: { id },
        include: {
          documents: {
            select: {
              id: true,
              name: true,
              type: true,
              size: true,
              uploadedAt: true,
            },
            orderBy: { uploadedAt: "asc" },
          },
          exams: true,
          student: true,
        },
      });
    } catch (qErr: any) {
      console.error("Prisma query failed, trying raw SQL:", qErr?.message);
      const rows: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT * FROM "Applicant" WHERE "id" = $1`, id
      );
      applicant = rows?.[0] || null;
    }

    if (!applicant) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // If Prisma didn't return documents, fetch via raw SQL
    if (!applicant.documents) {
      try {
        applicant.documents = await (prisma as any).$queryRawUnsafe(
          `SELECT "id", "name", "type", "size", "uploadedAt" FROM "ApplicantDocument" WHERE "applicantId" = $1 ORDER BY "uploadedAt" ASC`, id
        );
      } catch (docErr: any) {
        console.error("Failed to fetch documents:", docErr?.message);
        applicant.documents = [];
      }
    }

    // Add hasContent flag for each document
    if (applicant.documents && Array.isArray(applicant.documents)) {
      applicant.documents = applicant.documents.map((doc: any) => ({
        ...doc,
        hasContent: true,
      }));
    }

    return NextResponse.json(applicant);
  } catch (error) {
    console.error("GET /api/admissions/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["OWNER", "SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;
    const session = authResult.session;

    const { id } = await params;
    const body = await request.json();
    const { status, reason } = body;

    const existing = await prisma.applicant.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const newStatus = status ?? existing.status;

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
        rejectionReason: reason ?? body.rejectionReason ?? existing.rejectionReason,
        examDate: body.examDate ? new Date(body.examDate) : existing.examDate,
        interviewDate: body.interviewDate ? new Date(body.interviewDate) : existing.interviewDate,
        reviewedAt: newStatus !== "pending" ? new Date() : existing.reviewedAt,
        reviewedBy: session?.user?.email || session?.user?.name || null,
        assignedClassId,
        assignedArm,
      },
      include: {
        documents: true,
        exams: true,
        student: true,
      },
    });

    // Auto-create Student + User account when admitted
    let studentCredentials = null;
    if (newStatus === "admitted" && !existing.student) {
      const admissionNumber = generateAdmissionNumber();
      const defaultPassword = existing.dateOfBirth
        ? `${existing.firstName.toLowerCase()}${new Date(existing.dateOfBirth).getFullYear()}`
        : `${existing.firstName.toLowerCase()}${new Date().getFullYear()}`;

      let userId: string | null = null;
      if (existing.email) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const user = await prisma.user.upsert({
          where: { email: existing.email },
          update: {},
          create: {
            email: existing.email,
            name: `${existing.firstName} ${existing.lastName}`,
            password: hashedPassword,
            phone: existing.phone,
            schoolId: existing.schoolId,
            mustChangePassword: true,
          },
        });
        userId = user.id;

        const studentRole = await prisma.role.findFirst({ where: { name: "STUDENT" } });
        if (studentRole) {
          const existingUserRole = await prisma.userRole.findFirst({
            where: { userId: user.id, roleId: studentRole.id },
          });
          if (!existingUserRole) {
            await prisma.userRole.create({
              data: { userId: user.id, roleId: studentRole.id },
            });
          }
        }

        studentCredentials = {
          email: existing.email,
          password: defaultPassword,
          admissionNumber,
        };
      }

      const student = await prisma.student.create({
        data: {
          admissionNumber,
          firstName: existing.firstName,
          lastName: existing.lastName,
          middleName: existing.middleName,
          dateOfBirth: existing.dateOfBirth,
          gender: existing.gender,
          bloodGroup: existing.bloodGroup,
          nationality: existing.nationality || "Nigerian",
          stateOfOrigin: existing.stateOfOrigin,
          address: existing.address,
          phone: existing.phone,
          email: existing.email,
          photo: existing.photo,
          schoolId: existing.schoolId,
          classId: assignedClassId,
          userId: userId || undefined,
          applicantId: existing.id,
        },
      });
    }

    if (newStatus === "admitted" && existing.email) {
      try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (RESEND_API_KEY) {
          const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
          const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
          const schoolPhone = process.env.SCHOOL_PHONE || SCHOOL_CONFIG.phone;

          const emailRecipients = [existing.email];
          if (existing.guardianEmail && existing.guardianEmail !== existing.email) {
            emailRecipients.push(existing.guardianEmail);
          }

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${schoolName} <${schoolEmail}>`,
              to: emailRecipients,
              subject: `Admission Offer - ${schoolName} (${existing.applicationNumber})`,
              html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #fff; border-radius: 16px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #0039a6, #0055ff); padding: 40px 30px; text-align: center;">
                    <h1 style="font-size: 28px; font-weight: 800; margin: 0;">Congratulations!</h1>
                    <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">You have been admitted to ${schoolName}</p>
                  </div>
                  <div style="padding: 30px;">
                    <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 20px;">
                      Dear ${existing.firstName} ${existing.lastName},
                    </p>
                    <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 20px;">
                      We are pleased to inform you that your application (<strong>${existing.applicationNumber}</strong>) has been approved and you have been admitted into <strong>${existing.classAppliedFor}</strong> at ${schoolName} for the ${new Date().getFullYear()}/${new Date().getFullYear() + 1} academic session.
                    </p>
                    <div style="background: rgba(40,255,156,0.08); border: 1px solid rgba(40,255,156,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
                      <p style="color: #28ff9c; font-weight: 700; margin-bottom: 8px;">Your Login Credentials:</p>
                      <table style="color: rgba(255,255,255,0.7); line-height: 1.8; width: 100%;">
                        <tr><td style="padding-right: 10px;">Email:</td><td><strong style="color: #fff;">${existing.email}</strong></td></tr>
                        <tr><td style="padding-right: 10px;">Password:</td><td><strong style="color: #fff;">${studentCredentials?.password || ""}</strong></td></tr>
                        <tr><td style="padding-right: 10px;">Admission No:</td><td><strong style="color: #fff;">${studentCredentials?.admissionNumber || ""}</strong></td></tr>
                      </table>
                      <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 10px;">You will be required to change your password on first login.</p>
                    </div>
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
                      For enquiries, contact us at <a href="mailto:${schoolEmail}" style="color: #28ff9c;">${schoolEmail}</a> or call <strong>${schoolPhone}</strong>.
                    </p>
                    <p style="color: rgba(255,255,255,0.5); margin-top: 20px;">Warm regards,<br/><strong>${schoolName} Admissions Team</strong></p>
                  </div>
                </div>
              `,
            }),
          });
        }
      } catch (emailError) {
        console.error("Failed to send admission email:", emailError);
      }
    }

    if (newStatus === "rejected" && (existing.email || existing.guardianEmail)) {
      try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (RESEND_API_KEY) {
          const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
          const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
          const rejectRecipients = [existing.email, existing.guardianEmail].filter(Boolean) as string[];
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${schoolName} <${schoolEmail}>`,
              to: rejectRecipients,
              subject: `Application Update - ${schoolName} (${existing.applicationNumber})`,
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
                      Thank you for your interest in ${schoolName}. After careful review, we regret to inform you that we are unable to offer admission at this time for application <strong>${existing.applicationNumber}</strong>.
                    </p>
                    ${reason ? `<p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 15px;"><strong>Reason:</strong> ${reason}</p>` : ""}
                    <p style="color: rgba(255,255,255,0.5); line-height: 1.7; margin-top: 20px;">
                      We encourage you to apply again in the future. For any queries, contact us at <a href="mailto:${schoolEmail}" style="color: #3b82f6;">${schoolEmail}</a>.
                    </p>
                    <p style="color: rgba(255,255,255,0.5); margin-top: 20px;">Warm regards,<br/><strong>${schoolName} Admissions Team</strong></p>
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

    if (["under_review", "interview"].includes(newStatus) && existing.status !== newStatus) {
      try {
        await sendApplicationStatusUpdateEmail(
          {
            firstName: existing.firstName,
            lastName: existing.lastName,
            applicationNumber: existing.applicationNumber,
            classAppliedFor: existing.classAppliedFor,
            email: existing.email,
            guardianName: existing.guardianName,
            guardianEmail: existing.guardianEmail,
            guardianPhone: existing.guardianPhone,
          },
          newStatus,
          body.decisionNote,
          newStatus === "interview"
            ? {
                interviewDate: body.interviewDate || existing.interviewDate?.toISOString(),
                interviewTime: body.interviewTime,
              }
            : undefined
        );
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    }

    // Generate entrance exam and send email when status changes to "exam"
    if (newStatus === "exam" && existing.status !== "exam") {
      try {
        const crypto = await import("crypto");
        const token = crypto.randomBytes(32).toString("base64url");

        const examDate = body.examDate ? new Date(body.examDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const startTime = body.startTime || "10:00 AM";
        const endTime = body.endTime || "12:00 PM";
        const durationMins = body.durationMins || 60;

        const EXAM_QUESTIONS = [
          {
            subject: "Mathematics",
            questions: [
              { q: "What is the value of 2x + 5 when x = 3?", options: ["8", "11", "13", "15"], answer: 1 },
              { q: "Simplify: 3(2a + 4) - 5a", options: ["a + 12", "a + 8", "6a + 12", "6a + 8"], answer: 0 },
              { q: "What is 15% of 200?", options: ["25", "30", "35", "40"], answer: 1 },
              { q: "Solve: 2x - 7 = 15", options: ["x = 8", "x = 9", "x = 11", "x = 13"], answer: 2 },
              { q: "What is the area of a rectangle with length 8cm and width 5cm?", options: ["13cm²", "26cm²", "40cm²", "80cm²"], answer: 2 },
              { q: "What is 3² + 4²?", options: ["7", "12", "24", "25"], answer: 3 },
              { q: "What is the value of √144?", options: ["11", "12", "13", "14"], answer: 1 },
            ],
          },
          {
            subject: "English Language",
            questions: [
              { q: "Choose the correct spelling:", options: ["Definately", "Definitely", "Definatly", "Definetly"], answer: 1 },
              { q: "Which word is a synonym of 'happy'?", options: ["Sad", "Angry", "Joyful", "Tired"], answer: 2 },
              { q: "Identify the noun: 'The cat sat on the mat.'", options: ["sat", "on", "cat", "the"], answer: 2 },
              { q: "Which is the correct form? 'She ___ to school daily.'", options: ["go", "goes", "going", "gone"], answer: 1 },
              { q: "Choose the antonym of 'brave':", options: ["Courageous", "Fearless", "Cowardly", "Bold"], answer: 2 },
              { q: "Which sentence is correct?", options: ["He don't like it", "He doesn't likes it", "He doesn't like it", "He not like it"], answer: 2 },
            ],
          },
          {
            subject: "Science",
            questions: [
              { q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
              { q: "What is the boiling point of water in Celsius?", options: ["90°C", "95°C", "100°C", "110°C"], answer: 2 },
              { q: "Which organ pumps blood in the human body?", options: ["Lungs", "Brain", "Heart", "Liver"], answer: 2 },
              { q: "What is the largest planet in our solar system?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: 2 },
              { q: "Photosynthesis occurs in which part of a plant?", options: ["Roots", "Stem", "Leaves", "Flowers"], answer: 2 },
              { q: "Which gas do humans breathe in to survive?", options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"], answer: 2 },
              { q: "What is the process by which water turns into vapour?", options: ["Condensation", "Evaporation", "Freezing", "Melting"], answer: 1 },
            ],
          },
        ];

        const allQuestions: any[] = [];
        for (const subject of EXAM_QUESTIONS) {
          for (const q of subject.questions) {
            allQuestions.push({
              subject: subject.subject,
              question: q.q,
              options: q.options,
              answer: q.answer,
            });
          }
        }

        const existingExam = await prisma.entranceExam.findUnique({ where: { applicantId: existing.id } });
        if (!existingExam) {
          await prisma.entranceExam.create({
            data: {
              applicantId: existing.id,
              token,
              examDate,
              startTime,
              endTime,
              durationMins,
              subjects: EXAM_QUESTIONS.map((s) => s.subject),
              questions: allQuestions,
              totalQuestions: allQuestions.length,
              status: "pending",
            },
          });

          const websiteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ffb-erp.vercel.app";
          const examUrl = `${websiteUrl}/portal/entrance-exam/${token}`;

          const { sendEntranceExamEmail } = await import("@/lib/resend");
          await sendEntranceExamEmail({
            firstName: existing.firstName,
            lastName: existing.lastName,
            applicationNumber: existing.applicationNumber,
            classAppliedFor: existing.classAppliedFor,
            email: existing.email || "",
            guardianName: existing.guardianName || undefined,
            guardianEmail: existing.guardianEmail || undefined,
            examDate,
            startTime,
            endTime,
            durationMins,
            examUrl,
          });
        }
      } catch (examError) {
        console.error("Failed to create entrance exam:", examError);
      }
    }

    return NextResponse.json({ success: true, applicant });
  } catch (error) {
    console.error("PUT /api/admissions/[id] error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const { id } = await params;

    const existing = await prisma.applicant.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await prisma.applicant.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admissions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
