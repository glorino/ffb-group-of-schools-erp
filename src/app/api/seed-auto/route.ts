import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({ success: true, message: "Database already seeded", userCount });
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

    const admin = await prisma.user.upsert({
      where: { email: "admin@ffb.edu.ng" },
      update: { password: adminHash },
      create: { email: "admin@ffb.edu.ng", name: "Admin User", password: adminHash, phone: "+2348012345678", schoolId: school.id },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId_schoolId: { userId: admin.id, roleId: roles.ADMINISTRATOR, schoolId: school.id } },
      update: {},
      create: { userId: admin.id, roleId: roles.ADMINISTRATOR, schoolId: school.id },
    });

    const teacher = await prisma.user.upsert({
      where: { email: "teacher@ffb.edu.ng" },
      update: { password: teacherHash },
      create: { email: "teacher@ffb.edu.ng", name: "Fatima Bello", password: teacherHash, phone: "+2348023456789", schoolId: school.id },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId_schoolId: { userId: teacher.id, roleId: roles.TEACHER, schoolId: school.id } },
      update: {},
      create: { userId: teacher.id, roleId: roles.TEACHER, schoolId: school.id },
    });

    const studentUser = await prisma.user.upsert({
      where: { email: "adebayo.johnson@student.ffb.edu.ng" },
      update: { password: studentHash },
      create: { email: "adebayo.johnson@student.ffb.edu.ng", name: "Adebayo Johnson", password: studentHash, phone: "+2348034567890", schoolId: school.id },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId_schoolId: { userId: studentUser.id, roleId: roles.STUDENT, schoolId: school.id } },
      update: {},
      create: { userId: studentUser.id, roleId: roles.STUDENT, schoolId: school.id },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      users: ["admin@ffb.edu.ng", "teacher@ffb.edu.ng", "adebayo.johnson@student.ffb.edu.ng"],
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seeding failed", details: error.message }, { status: 500 });
  }
}