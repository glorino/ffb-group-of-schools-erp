import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { AdmissionSchema } from "@/lib/validations";
import { getDefaultSchoolId } from "@/lib/school";
import { sendApplicationSubmittedEmail } from "@/lib/resend";
import { generateApplicationNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { applicationNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;

    let applicants: any[] = [];
    let total = 0;
    try {
      [applicants, total] = await Promise.all([
        prisma.applicant.findMany({
          where,
          skip,
          take: limit,
          orderBy: { submittedAt: "desc" },
        }),
        prisma.applicant.count({ where }),
      ]);
    } catch (queryErr: any) {
      console.error("Applicant query failed, trying without relations:", queryErr?.message);
      applicants = await (prisma as any).$queryRawUnsafe(
        `SELECT * FROM "Applicant" ORDER BY "submittedAt" DESC LIMIT ${limit} OFFSET ${skip}`
      );
      const countResult: any[] = await (prisma as any).$queryRawUnsafe(`SELECT COUNT(*) as count FROM "Applicant"`);
      total = Number(countResult?.[0]?.count ?? 0);
    }

    return NextResponse.json({
      applicants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admissions", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AdmissionSchema.parse(body);
    const documents: { name: string; type: string; url: string; size?: number }[] = (body as any).documents || [];

    let applicationNumber = generateApplicationNumber();
    let retries = 0;
    while (retries < 5) {
      const existing = await prisma.applicant.findUnique({ where: { applicationNumber } });
      if (!existing) break;
      applicationNumber = generateApplicationNumber();
      retries++;
    }

    const schoolId = validated.schoolId || await getDefaultSchoolId();

    const schoolClass = await prisma.schoolClass.findFirst({
      where: { schoolId, name: validated.classAppliedFor },
      select: { capacity: true, name: true },
    });

    if (schoolClass) {
      const [enrolledCount, admittedCount] = await Promise.all([
        prisma.student.count({ where: { classId: schoolClass.name, schoolId } }),
        prisma.applicant.count({ where: { schoolId, classAppliedFor: schoolClass.name, status: "admitted" } }),
      ]);
      if (enrolledCount + admittedCount >= schoolClass.capacity) {
        return NextResponse.json({ error: `Sorry, ${schoolClass.name} is full. No more applications can be accepted for this class.` }, { status: 400 });
      }
    }

    const applicant = await prisma.applicant.create({
      data: {
        applicationNumber,
        firstName: validated.firstName,
        lastName: validated.lastName,
        middleName: validated.middleName,
        email: validated.email || "",
        phone: validated.phone || "",
        dateOfBirth: new Date(validated.dateOfBirth),
        gender: validated.gender,
        classAppliedFor: validated.classAppliedFor,
        previousSchool: validated.previousSchool,
        schoolId: validated.schoolId || await getDefaultSchoolId(),
        guardianName: validated.guardianName,
        guardianPhone: validated.guardianPhone,
        guardianEmail: validated.guardianEmail,
        guardianRelationship: validated.guardianRelationship,
        address: validated.address,
        nationality: validated.nationality,
        stateOfOrigin: validated.stateOfOrigin,
        bloodGroup: validated.bloodGroup,
      },
    });

    if (Array.isArray(documents) && documents.length > 0) {
      await prisma.applicantDocument.createMany({
        data: documents.map((doc) => ({
          applicantId: applicant.id,
          name: doc.name,
          type: doc.type,
          url: doc.url,
          size: doc.size ?? null,
        })),
      });
    }

    try {
      await sendApplicationSubmittedEmail({
        firstName: validated.firstName,
        lastName: validated.lastName,
        applicationNumber,
        classAppliedFor: validated.classAppliedFor,
        email: validated.email || "",
        guardianName: validated.guardianName,
        guardianEmail: validated.guardianEmail,
        guardianPhone: validated.guardianPhone,
      });
    } catch (emailError) {
      console.error("Failed to send submission email:", emailError);
    }

    return NextResponse.json({
      success: true,
      applicationNumber,
      applicant,
      message: "Application submitted successfully",
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    console.error("POST /api/admissions error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
