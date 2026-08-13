import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultSchoolId } from "@/lib/school";
import { CalendarEventSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: any = {};
    if (start && end) {
      where.start = { gte: new Date(start) };
      where.end = { lte: new Date(end) };
    }

    const events = await prisma.calendarEvent.findMany({ where, orderBy: { start: "asc" } });
    const schoolEvents = await prisma.schoolEvent.findMany({ orderBy: { startDate: "asc" } });

    return NextResponse.json({ calendarEvents: events, schoolEvents });
  } catch (error) {
    console.error("GET /api/calendar error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = CalendarEventSchema.parse(body);
    const { title, start } = validated;

    const schoolId = await getDefaultSchoolId();
    const event = await prisma.calendarEvent.create({
      data: {
        schoolId,
        title,
        start: new Date(start),
        end: validated.end ? new Date(validated.end) : new Date(start),
        allDay: validated.allDay || false,
        type: validated.type || "event",
        description: validated.description || undefined,
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/calendar error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
