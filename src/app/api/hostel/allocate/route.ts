import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { studentId, roomId, hostelId, bedNumber } = body;

    if (!studentId || !roomId || !hostelId) {
      return NextResponse.json({ error: "studentId, roomId, and hostelId are required" }, { status: 400 });
    }

    const existing = await prisma.hostelAllocation.findFirst({
      where: { studentId, status: "active" },
    });
    if (existing) {
      return NextResponse.json({ error: "Student already has an active allocation" }, { status: 409 });
    }

    const room = await prisma.hostelRoom.findUnique({
      where: { id: roomId },
      include: { beds: true, allocations: { where: { status: "active" } } },
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.allocations.length >= room.capacity) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    const allocation = await prisma.hostelAllocation.create({
      data: {
        studentId,
        roomId,
        hostelId,
        bedNumber: bedNumber || room.allocations.length + 1,
        startDate: new Date(),
        status: "active",
      },
    });

    return NextResponse.json({ success: true, allocation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/hostel/allocate error:", error);
    return NextResponse.json({ error: "Failed to allocate student" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing allocation ID" }, { status: 400 });

    await prisma.hostelAllocation.update({
      where: { id },
      data: { status: "inactive", endDate: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/hostel/allocate error:", error);
    return NextResponse.json({ error: "Failed to deallocate student" }, { status: 500 });
  }
}
