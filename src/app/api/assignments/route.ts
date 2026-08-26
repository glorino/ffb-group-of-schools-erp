import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth([
      "OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL",
      "TEACHER", "STUDENT", "PARENT",
    ]);
    if (authResult.error) return authResult.error;
    const { session, userRoles } = authResult;

    const userId = (session!.user as any).id as string;
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "";
    const subjectId = searchParams.get("subjectId") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (status) where.status = status;

    const isStudent = userRoles.some((r) => r === "STUDENT");
    const isTeacher = userRoles.some((r) => r === "TEACHER");
    const isAdmin = userRoles.some((r) =>
      ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r)
    );

    if (isTeacher) {
      const teacher = await prisma.teacher.findFirst({ where: { userId } });
      if (teacher) {
        where.teacherId = teacher.id;
      }
    }

    if (isStudent) {
      const student = await prisma.student.findFirst({ where: { userId } });
      if (student) {
        where.classId = student.classId || undefined;
      }
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
          class: { select: { id: true, name: true, displayName: true } },
          subject: { select: { id: true, name: true, code: true } },
          _count: { select: { submissions: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.assignment.count({ where }),
    ]);

    const enriched = await Promise.all(
      assignments.map(async (a) => {
        let mySubmission = null;
        if (isStudent) {
          const student = await prisma.student.findFirst({ where: { userId } });
          if (student) {
            mySubmission = await prisma.assignmentSubmission.findFirst({
              where: { assignmentId: a.id, studentId: student.id },
            });
          }
        }
        return { ...a, mySubmission };
      })
    );

    return NextResponse.json({
      assignments: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth([
      "OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER",
    ]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;

    const userId = (session!.user as any).id as string;
    const body = await request.json();

    const teacher = await prisma.teacher.findFirst({ where: { userId } });
    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const { title, description, classId, subjectId, dueDate, totalMarks, type, attachments } = body;

    if (!title || !classId || !subjectId || !dueDate) {
      return NextResponse.json(
        { error: "title, classId, subjectId, and dueDate are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || undefined,
        classId,
        subjectId,
        teacherId: teacher.id,
        dueDate: new Date(dueDate),
        totalMarks: totalMarks || 100,
        type: type || "homework",
        attachments: attachments || undefined,
      },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, assignment }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/assignments error:", error);
    return NextResponse.json({ error: error.message || "Failed to create assignment" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth([
      "OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER",
    ]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;

    const userId = (session!.user as any).id as string;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const teacher = await prisma.teacher.findFirst({ where: { userId } });
    const isAdmin = (session!.user as any).roles?.some((r: any) =>
      ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r.name)
    );

    if (!isAdmin && teacher) {
      const existing = await prisma.assignment.findFirst({ where: { id, teacherId: teacher.id } });
      if (!existing) return NextResponse.json({ error: "Assignment not found or unauthorized" }, { status: 404 });
    }

    const data: any = {};
    if (updates.title) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.classId) data.classId = updates.classId;
    if (updates.subjectId) data.subjectId = updates.subjectId;
    if (updates.dueDate) data.dueDate = new Date(updates.dueDate);
    if (updates.totalMarks) data.totalMarks = updates.totalMarks;
    if (updates.type) data.type = updates.type;
    if (updates.status) data.status = updates.status;
    if (updates.attachments !== undefined) data.attachments = updates.attachments;

    const assignment = await prisma.assignment.update({
      where: { id },
      data,
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error("PUT /api/assignments error:", error);
    return NextResponse.json({ error: error.message || "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth([
      "OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER",
    ]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;

    const userId = (session!.user as any).id as string;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const teacher = await prisma.teacher.findFirst({ where: { userId } });
    const isAdmin = (session!.user as any).roles?.some((r: any) =>
      ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r.name)
    );

    if (!isAdmin && teacher) {
      const existing = await prisma.assignment.findFirst({ where: { id, teacherId: teacher.id } });
      if (!existing) return NextResponse.json({ error: "Assignment not found or unauthorized" }, { status: 404 });
    }

    await prisma.assignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/assignments error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete assignment" }, { status: 500 });
  }
}
