import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"]);
    if (authResult.error) return authResult.error;

    const schoolId = await getDefaultSchoolId();
    const events = await prisma.schoolEvent.findMany({
      where: { schoolId },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { title, description, startDate, endDate, location, type, color, recurrence } = body;

    if (!title || !startDate) {
      return NextResponse.json({ error: "Title and start date are required" }, { status: 400 });
    }

    const schoolId = await getDefaultSchoolId();
    const event = await prisma.schoolEvent.create({
      data: {
        schoolId,
        title,
        description: description || undefined,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        location: location || undefined,
        type: type || "event",
        color: color || undefined,
        recurrence: recurrence || undefined,
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, title, description, startDate, endDate, location, type, color, recurrence } = body;

    if (!id) return NextResponse.json({ error: "Missing event ID" }, { status: 400 });

    const event = await prisma.schoolEvent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(location !== undefined && { location }),
        ...(type && { type }),
        ...(color !== undefined && { color }),
        ...(recurrence !== undefined && { recurrence }),
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("PUT /api/events error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.schoolEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
