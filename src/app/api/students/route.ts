import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StudentCreateSchema } from "@/lib/validations";
import { generateAdmissionNumber } from "@/lib/utils";

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
    const classId = searchParams.get("classId") || "";
    const status = searchParams.get("status") || "";
    const gender = searchParams.get("gender") || "";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { admissionNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (classId) where.classId = classId;
    if (status) where.status = status;
    if (gender) where.gender = gender;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          class: true,
          guardians: { where: { isPrimary: true }, take: 1 },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = StudentCreateSchema.parse(body);

    const admissionNumber = generateAdmissionNumber();

    const student = await prisma.student.create({
      data: {
        admissionNumber,
        firstName: validated.firstName,
        lastName: validated.lastName,
        middleName: validated.middleName,
        dateOfBirth: new Date(validated.dateOfBirth),
        gender: validated.gender,
        bloodGroup: validated.bloodGroup,
        nationality: validated.nationality,
        stateOfOrigin: validated.stateOfOrigin,
        lga: validated.lga,
        address: validated.address,
        phone: validated.phone,
        email: validated.email || undefined,
        classId: validated.classId || undefined,
        schoolId: validated.schoolId,
        guardians: validated.guardian
          ? {
              create: {
                firstName: validated.guardian.firstName,
                lastName: validated.guardian.lastName,
                relationship: validated.guardian.relationship,
                phone: validated.guardian.phone,
                email: validated.guardian.email || undefined,
                address: validated.guardian.address,
                occupation: validated.guardian.occupation,
                isPrimary: validated.guardian.isPrimary,
              },
            }
          : undefined,
      },
      include: {
        class: true,
        guardians: true,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    console.error("POST /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
