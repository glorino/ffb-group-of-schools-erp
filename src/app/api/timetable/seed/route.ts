import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const existing = await prisma.timetableEntry.count();
    if (existing > 0) {
      return NextResponse.json({ success: true, message: "Timetable already seeded", count: existing });
    }

    const classes = await prisma.schoolClass.findMany({ select: { id: true, name: true } });
    const teachers = await prisma.teacher.findMany({ select: { id: true } });

    if (!classes.length || !teachers.length) {
      return NextResponse.json({ error: "No classes or teachers found" }, { status: 400 });
    }

    const days = [1, 2, 3, 4, 5];
    const times = [
      { start: "8:00 AM", end: "9:00 AM" },
      { start: "9:00 AM", end: "10:00 AM" },
      { start: "10:00 AM", end: "11:00 AM" },
      { start: "11:00 AM", end: "12:00 PM" },
      { start: "1:00 PM", end: "2:00 PM" },
      { start: "2:00 PM", end: "3:00 PM" },
    ];

    const subjects = ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Computer Science", "Literature", "History"];
    let count = 0;

    for (const cls of classes) {
      for (const day of days) {
        for (let ti = 0; ti < Math.min(times.length, 5); ti++) {
          try {
            await prisma.timetableEntry.create({
              data: {
                classId: cls.id,
                teacherId: teachers[count % teachers.length].id,
                dayOfWeek: day,
                startTime: times[ti].start,
                endTime: times[ti].end,
                room: `Room ${100 + count % 10}`,
                type: "lesson",
              },
            });
            count++;
          } catch {}
        }
      }
    }

    return NextResponse.json({ success: true, message: `Seeded ${count} timetable entries` });
  } catch (error) {
    console.error("Timetable seed error:", error);
    return NextResponse.json({ error: "Failed to seed timetable" }, { status: 500 });
  }
}
