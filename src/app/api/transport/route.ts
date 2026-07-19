import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vehicles = await prisma.vehicle.findMany({
      include: { routes: true },
      orderBy: { createdAt: "desc" },
    });

    const routes = await prisma.transportRoute.findMany({ include: { vehicle: true } });
    const activeVehicles = vehicles.filter(v => v.status === "active").length;

    return NextResponse.json({
      vehicles,
      routes,
      stats: { total: vehicles.length, active: activeVehicles, routes: routes.length },
    });
  } catch (error) {
    console.error("GET /api/transport error:", error);
    return NextResponse.json({ error: "Failed to fetch transport data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, plateNumber, type, capacity, driverName, driverPhone } = body;

    if (!name || !plateNumber) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const schoolId = await getDefaultSchoolId();
    const vehicle = await prisma.vehicle.create({
      data: {
        schoolId,
        name,
        plateNumber,
        type: type || "bus",
        capacity: parseInt(capacity) || 30,
        driverName: driverName || undefined,
        driverPhone: driverPhone || undefined,
      },
    });

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transport error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
