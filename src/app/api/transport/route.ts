import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";
import { TransportVehicleSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

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
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = TransportVehicleSchema.parse(body);
    const { name, plateNumber, type, capacity, driverName, driverPhone } = validated;

    const schoolId = await getDefaultSchoolId();
    const vehicle = await prisma.vehicle.create({
      data: {
        schoolId,
        name,
        plateNumber,
        type,
        capacity,
        driverName,
        driverPhone,
      },
    });

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transport error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
