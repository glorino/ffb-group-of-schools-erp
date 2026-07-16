import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    if (secret !== "ffb-seed-2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const school = await prisma.school.upsert({
      where: { slug: "ffb-main" },
      update: {},
      create: {
        name: "FFB Group of Schools", slug: "ffb-main", email: "info@ffb.edu.ng",
        phone: "+234 905 998 0991", address: "123 Education Avenue, GRA",
        city: "Lagos", state: "Lagos", country: "Nigeria",
        motto: "Knowledge, Excellence, Integrity", type: "secondary", status: "active",
      },
    });

    const roleData = [
      { name: "ADMINISTRATOR", level: 80, description: "School Administrator" },
      { name: "TEACHER", level: 50, description: "Subject Teacher" },
      { name: "STUDENT", level: 10, description: "Student" },
      { name: "PRINCIPAL", level: 75, description: "School Principal" },
      { name: "VICE_PRINCIPAL", level: 70, description: "Vice Principal" },
    ];
    const roles: Record<string, string> = {};
    for (const r of roleData) {
      const role = await prisma.role.upsert({ where: { name: r.name }, update: {}, create: r });
      roles[r.name] = role.id;
    }

    const adminHash = await bcrypt.hash("admin123", 10);
    const teacherHash = await bcrypt.hash("teacher123", 10);
    const studentHash = await bcrypt.hash("student123", 10);

    let admin = await prisma.user.findUnique({ where: { email: "admin@ffb.edu.ng" } });
    if (!admin) {
      admin = await prisma.user.create({
        data: { email: "admin@ffb.edu.ng", name: "Admin User", password: adminHash, phone: "+2348012345678", schoolId: school.id },
      });
    } else {
      await prisma.user.update({ where: { id: admin.id }, data: { password: adminHash } });
    }
    await prisma.userRole.upsert({
      where: { userId_roleId_schoolId: { userId: admin.id, roleId: roles.ADMINISTRATOR, schoolId: school.id } },
      update: {},
      create: { userId: admin.id, roleId: roles.ADMINISTRATOR, schoolId: school.id },
    });

    let teacher = await prisma.user.findUnique({ where: { email: "teacher@ffb.edu.ng" } });
    if (!teacher) {
      teacher = await prisma.user.create({
        data: { email: "teacher@ffb.edu.ng", name: "Fatima Bello", password: teacherHash, phone: "+2348023456789", schoolId: school.id },
      });
    } else {
      await prisma.user.update({ where: { id: teacher.id }, data: { password: teacherHash } });
    }
    await prisma.userRole.upsert({
      where: { userId_roleId_schoolId: { userId: teacher.id, roleId: roles.TEACHER, schoolId: school.id } },
      update: {},
      create: { userId: teacher.id, roleId: roles.TEACHER, schoolId: school.id },
    });

    let studentUser = await prisma.user.findUnique({ where: { email: "adebayo.johnson@student.ffb.edu.ng" } });
    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: { email: "adebayo.johnson@student.ffb.edu.ng", name: "Adebayo Johnson", password: studentHash, phone: "+2348034567890", schoolId: school.id },
      });
    } else {
      await prisma.user.update({ where: { id: studentUser.id }, data: { password: studentHash } });
    }
    await prisma.userRole.upsert({
      where: { userId_roleId_schoolId: { userId: studentUser.id, roleId: roles.STUDENT, schoolId: school.id } },
      update: {},
      create: { userId: studentUser.id, roleId: roles.STUDENT, schoolId: school.id },
    });

    const classData = [
      { name: "Nursery 1", displayName: "Nursery 1", section: "Nursery 1", capacity: 40, level: 1 },
      { name: "Nursery 2", displayName: "Nursery 2", section: "Nursery 2", capacity: 40, level: 2 },
      { name: "Primary 1", displayName: "Primary 1", section: "Primary 1", capacity: 40, level: 3 },
      { name: "Primary 2", displayName: "Primary 2", section: "Primary 2", capacity: 40, level: 4 },
      { name: "Primary 3", displayName: "Primary 3", section: "Primary 3", capacity: 40, level: 5 },
      { name: "Primary 4", displayName: "Primary 4", section: "Primary 4", capacity: 40, level: 6 },
      { name: "Primary 5", displayName: "Primary 5", section: "Primary 5", capacity: 40, level: 7 },
      { name: "Primary 6", displayName: "Primary 6", section: "Primary 6", capacity: 40, level: 8 },
      { name: "JSS 1", displayName: "JSS 1", section: "JSS 1", capacity: 40, level: 9 },
      { name: "JSS 2", displayName: "JSS 2", section: "JSS 2", capacity: 40, level: 10 },
      { name: "JSS 3", displayName: "JSS 3", section: "JSS 3", capacity: 40, level: 11 },
      { name: "SSS 1", displayName: "SSS 1", section: "SSS 1", capacity: 40, level: 12 },
      { name: "SSS 2", displayName: "SSS 2", section: "SSS 2", capacity: 40, level: 13 },
      { name: "SSS 3", displayName: "SSS 3", section: "SSS 3", capacity: 40, level: 14 },
    ];

    for (const cls of classData) {
      const existing = await prisma.schoolClass.findFirst({ where: { schoolId: school.id, name: cls.name } });
      if (!existing) {
        await prisma.schoolClass.create({ data: { ...cls, schoolId: school.id } });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      users: ["admin@ffb.edu.ng", "teacher@ffb.edu.ng", "adebayo.johnson@student.ffb.edu.ng"],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seeding failed", details: String(error) }, { status: 500 });
  }
}
