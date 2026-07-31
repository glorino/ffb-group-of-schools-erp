import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["PORTER", "OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && ["expected", "checked_in", "checked_out"].includes(status)) {
      where.status = status;
    }

    const visitors = await prisma.hostelVisitor.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        hostel: { select: { id: true, name: true } },
      },
      orderBy: { visitDate: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, visitors });
  } catch (error) {
    console.error("GET /api/hostel/visitors error:", error);
    return NextResponse.json({ error: "Failed to fetch visitors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["PORTER", "OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { hostelId, studentId, visitorName, visitorPhone, purpose } = body;

    if (!hostelId || !studentId || !visitorName || !visitorPhone || !purpose) {
      return NextResponse.json({ error: "Missing required fields: hostelId, studentId, visitorName, visitorPhone, purpose" }, { status: 400 });
    }

    const now = new Date();
    const visitor = await prisma.hostelVisitor.create({
      data: {
        hostelId,
        studentId,
        visitorName,
        visitorPhone,
        purpose,
        visitDate: now,
        inTime: now,
        status: "checked_in",
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, visitor }, { status: 201 });
  } catch (error) {
    console.error("POST /api/hostel/visitors error:", error);
    return NextResponse.json({ error: "Failed to create visitor log" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["PORTER", "OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required fields: id, action" }, { status: 400 });
    }

    if (!["check_in", "check_out"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'check_in' or 'check_out'" }, { status: 400 });
    }

    const existing = await prisma.hostelVisitor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    const now = new Date();
    let updateData: any = {};

    if (action === "check_in") {
      updateData = { inTime: now, status: "checked_in" };
    } else if (action === "check_out") {
      updateData = { outTime: now, status: "checked_out" };
    }

    const visitor = await prisma.hostelVisitor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, visitor });
  } catch (error) {
    console.error("PUT /api/hostel/visitors error:", error);
    return NextResponse.json({ error: "Failed to update visitor" }, { status: 500 });
  }
}
