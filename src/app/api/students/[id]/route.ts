import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StudentCreateSchema } from "@/lib/validations";

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

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        school: true,
        guardians: true,
        medicalRecords: true,
        documents: true,
        attendanceRecords: {
          orderBy: { date: "desc" },
          take: 30,
        },
        invoices: {
          include: { schoolFee: true, payments: true },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        grades: {
          include: { subject: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        timeline: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        achievements: true,
        disciplineRecords: true,
        hostels: {
          include: { hostel: true, room: true },
        },
        clinicVisits: {
          orderBy: { date: "desc" },
          take: 10,
        },
        vaccinations: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("GET /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
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

    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: body.firstName ?? existing.firstName,
        lastName: body.lastName ?? existing.lastName,
        middleName: body.middleName ?? existing.middleName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : existing.dateOfBirth,
        gender: body.gender ?? existing.gender,
        bloodGroup: body.bloodGroup ?? existing.bloodGroup,
        nationality: body.nationality ?? existing.nationality,
        stateOfOrigin: body.stateOfOrigin ?? existing.stateOfOrigin,
        lga: body.lga ?? existing.lga,
        address: body.address ?? existing.address,
        phone: body.phone ?? existing.phone,
        email: body.email ?? existing.email,
        classId: body.classId ?? existing.classId,
        status: body.status ?? existing.status,
      },
      include: {
        class: true,
        guardians: true,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("PUT /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
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

    const existing = await prisma.student.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
