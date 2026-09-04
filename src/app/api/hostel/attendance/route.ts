import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "PORTER"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || "";
    const date = searchParams.get("date") || "";
    const hostelId = searchParams.get("hostelId") || "";

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (hostelId) where.hostelId = hostelId;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    }

    const records = await prisma.hostelQRAttendance.findMany({
      where,
      include: { student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("GET /api/hostel/attendance error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "PORTER", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { studentId, scanType, roomId, hostelId } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.hostelQRAttendance.findFirst({
      where: { studentId, date: today, scanType: scanType || "entry" },
    });

    if (existing) {
      return NextResponse.json({ error: `Already scanned ${scanType || "entry"} today` }, { status: 409 });
    }

    const record = await prisma.hostelQRAttendance.create({
      data: {
        studentId,
        date: today,
        time: new Date(),
        scanType: scanType || "entry",
        status: "present",
        roomId: roomId || undefined,
        hostelId: hostelId || undefined,
        validated: true,
      },
      include: { student: { select: { firstName: true, lastName: true, admissionNumber: true } } },
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    console.error("POST /api/hostel/attendance error:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
