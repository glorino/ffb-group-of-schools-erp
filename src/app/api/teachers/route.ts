import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";
import { TeacherCreateSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
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
        { employeeId: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: {
          teacherSubjects: { include: { subject: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.teacher.count({ where }),
    ]);

    return NextResponse.json({
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/teachers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = TeacherCreateSchema.parse(body);

    const employeeId = `TCH/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    const schoolId = validated.schoolId || await getDefaultSchoolId();

    const teacher = await prisma.teacher.create({
      data: {
        employeeId,
        firstName: validated.firstName,
        lastName: validated.lastName,
        middleName: validated.middleName,
        email: validated.email,
        phone: validated.phone,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : undefined,
        gender: validated.gender,
        qualification: validated.qualification,
        specialization: validated.specialization,
        schoolId,
        teacherSubjects: validated.subjectIds?.length
          ? {
              create: validated.subjectIds.map((subjectId) => ({
                subjectId,
              })),
            }
          : undefined,
      },
      include: {
        teacherSubjects: { include: { subject: true } },
      },
    });

    // Create user account with default password demo@123
    if (validated.email) {
      const hashedPassword = await bcrypt.hash("demo@123", 10);
      const user = await prisma.user.upsert({
        where: { email: validated.email },
        update: {},
        create: {
          email: validated.email,
          name: `${validated.firstName} ${validated.lastName}`,
          password: hashedPassword,
          phone: validated.phone,
          schoolId,
          mustChangePassword: true,
        },
      });
      await prisma.teacher.update({ where: { id: teacher.id }, data: { userId: user.id } });
      const teacherRole = await prisma.role.findFirst({ where: { name: "TEACHER" } });
      if (teacherRole) {
        const existingUserRole = await prisma.userRole.findFirst({
          where: { userId: user.id, roleId: teacherRole.id },
        });
        if (!existingUserRole) {
          await prisma.userRole.create({
            data: { userId: user.id, roleId: teacherRole.id },
          });
        }
      }
    }

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.message }, { status: 400 });
    }
    console.error("POST /api/teachers error:", error);
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}
