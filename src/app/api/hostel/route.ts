import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "PORTER"]);
    if (authResult.error) return authResult.error;

    const hostels = await prisma.hostel.findMany({
      include: {
        rooms: {
          include: { beds: true },
        },
      },
    });

    const totalBeds = hostels.reduce((sum, h) => sum + h.rooms.reduce((rs, r) => rs + r.capacity, 0), 0);
    const totalRooms = hostels.reduce((sum, h) => sum + h.rooms.length, 0);
    const allocations = await prisma.hostelAllocation.count({ where: { status: "active" } });
    const occupiedBeds = await prisma.hostelBed.count({ where: { status: "occupied" } });

    return NextResponse.json({
      hostels,
      stats: { totalHostels: hostels.length, totalRooms, totalBeds, occupiedBeds, allocations },
    });
  } catch (error) {
    console.error("GET /api/hostel error:", error);
    return NextResponse.json({ error: "Failed to fetch hostels" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "PORTER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { name, type, capacity, address } = body;

    if (!name || !capacity) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const schoolId = await getDefaultSchoolId();
    const hostel = await prisma.hostel.create({
      data: { schoolId, name, type: type || "mixed", capacity: parseInt(capacity), address: address || undefined },
    });

    return NextResponse.json({ success: true, hostel }, { status: 201 });
  } catch (error) {
    console.error("POST /api/hostel error:", error);
    return NextResponse.json({ error: "Failed to create hostel" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "PORTER"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, name, type, capacity, address, status } = body;

    if (!id) return NextResponse.json({ error: "Missing hostel ID" }, { status: 400 });

    const hostel = await prisma.hostel.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(address !== undefined && { address }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, hostel });
  } catch (error) {
    console.error("PUT /api/hostel error:", error);
    return NextResponse.json({ error: "Failed to update hostel" }, { status: 500 });
  }
}
