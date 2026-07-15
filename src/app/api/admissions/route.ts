import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AdmissionSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const [applicants, total] = await Promise.all([
      prisma.applicant.findMany({
        where,
        include: {
          documents: true,
          student: true,
        },
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
      }),
      prisma.applicant.count({ where }),
    ]);

    return NextResponse.json({
      applicants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AdmissionSchema.parse(body);

    const applicationNumber = `APP/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    const applicant = await prisma.applicant.create({
      data: {
        applicationNumber,
        firstName: validated.firstName,
        lastName: validated.lastName,
        middleName: validated.middleName,
        email: validated.email,
        phone: validated.phone,
        dateOfBirth: new Date(validated.dateOfBirth),
        gender: validated.gender,
        classAppliedFor: validated.classAppliedFor,
        previousSchool: validated.previousSchool,
        schoolId: validated.schoolId,
      },
    });

    return NextResponse.json(applicant, { status: 201 });
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
