import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

const DUPLICATE_NAMES = [
  "Junior Secondary 1",
  "Junior Secondary 2",
  "Junior Secondary 3",
  "Senior Secondary 1",
  "Senior Secondary 2",
  "Senior Secondary 3",
] as const;

const NAME_TO_ABBREVIATED: Record<string, string> = {
  "Junior Secondary 1": "JSS 1",
  "Junior Secondary 2": "JSS 2",
  "Junior Secondary 3": "JSS 3",
  "Senior Secondary 1": "SSS 1",
  "Senior Secondary 2": "SSS 2",
  "Senior Secondary 3": "SSS 3",
};

export async function POST() {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const school = await prisma.school.findFirst({ where: { slug: "ffb-main" } });
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId: school.id, isCurrent: true },
    });

    let deleted = 0;
    let moved = 0;

    for (const fullName of DUPLICATE_NAMES) {
      const abbreviated = NAME_TO_ABBREVIATED[fullName];

      const duplicateClass = await prisma.schoolClass.findFirst({
        where: {
          schoolId: school.id,
          name: fullName,
          ...(currentYear ? { academicYearId: currentYear.id } : {}),
        },
      });
      if (!duplicateClass) continue;

      const targetClass = await prisma.schoolClass.findFirst({
        where: {
          schoolId: school.id,
          name: abbreviated,
          ...(currentYear ? { academicYearId: currentYear.id } : {}),
        },
      });

      if (!targetClass) {
        await prisma.schoolClass.update({
          where: { id: duplicateClass.id },
          data: { name: abbreviated, displayName: abbreviated },
        });
        deleted++;
        continue;
      }

      // Move students from duplicate class to abbreviated class
      const studentsInDuplicate = await prisma.student.findMany({
        where: { classId: duplicateClass.id },
      });

      for (const student of studentsInDuplicate) {
        await prisma.student.update({
          where: { id: student.id },
          data: { classId: targetClass.id },
        });
        moved++;
      }

      // Move classSubjects
      const dupClassSubjects = await prisma.classSubject.findMany({
        where: { classId: duplicateClass.id },
      });
      for (const cs of dupClassSubjects) {
        try {
          await prisma.classSubject.upsert({
            where: { classId_subjectId: { classId: targetClass.id, subjectId: cs.subjectId } },
            update: {},
            create: { classId: targetClass.id, subjectId: cs.subjectId },
          });
        } catch {
          // Already exists on target, skip
        }
      }

      // Move attendanceRecords
      await prisma.attendanceRecord.updateMany({
        where: { classId: duplicateClass.id },
        data: { classId: targetClass.id },
      });

      // Move timetableEntries
      await prisma.timetableEntry.updateMany({
        where: { classId: duplicateClass.id },
        data: { classId: targetClass.id },
      });

      // Delete classSubjects of the duplicate
      await prisma.classSubject.deleteMany({ where: { classId: duplicateClass.id } });

      // Delete the duplicate class
      await prisma.schoolClass.delete({ where: { id: duplicateClass.id } });
      deleted++;
    }

    return NextResponse.json({ deleted, moved });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed", details: error.message }, { status: 500 });
  }
}
