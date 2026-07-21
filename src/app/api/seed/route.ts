import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    if (secret !== (process.env.SEED_SECRET || "ffb-seed-2025")) {
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
      { name: "OWNER", level: 100, description: "School Owner" },
      { name: "ADMINISTRATOR", level: 80, description: "School Administrator" },
      { name: "PRINCIPAL", level: 75, description: "School Principal" },
      { name: "VICE_PRINCIPAL", level: 70, description: "Vice Principal" },
      { name: "ACCOUNTANT", level: 65, description: "School Accountant" },
      { name: "AUDITOR", level: 60, description: "Financial Auditor" },
      { name: "TEACHER", level: 50, description: "Subject Teacher" },
      { name: "LIBRARIAN", level: 45, description: "School Librarian" },
      { name: "PORTER", level: 40, description: "Hostel Porter" },
      { name: "PARENT", level: 20, description: "Student Parent/Guardian" },
      { name: "ALUMNI", level: 15, description: "School Alumni" },
      { name: "STUDENT", level: 10, description: "Student" },
    ];
    const roles: Record<string, string> = {};
    for (const r of roleData) {
      const role = await prisma.role.upsert({ where: { name: r.name }, update: {}, create: r });
      roles[r.name] = role.id;
    }

    const pw = async (p: string) => bcrypt.hash(p, 10);

    const accounts = [
      { email: "owner@ffb.edu.ng", name: "Chief Okonkwo", password: await pw("owner123"), phone: "+2348000000001", role: "OWNER" },
      { email: "admin@ffb.edu.ng", name: "Admin User", password: await pw("admin123"), phone: "+2348012345678", role: "ADMINISTRATOR" },
      { email: "principal@ffb.edu.ng", name: "Dr. Aisha Bello", password: await pw("principal123"), phone: "+2348012345679", role: "PRINCIPAL" },
      { email: "vp@ffb.edu.ng", name: "Mr. Chinedu Okafor", password: await pw("vp123"), phone: "+2348012345680", role: "VICE_PRINCIPAL" },
      { email: "accountant@ffb.edu.ng", name: "Mrs. Funke Adeyemi", password: await pw("accountant123"), phone: "+2348012345681", role: "ACCOUNTANT" },
      { email: "auditor@ffb.edu.ng", name: "Mr. Tunde Williams", password: await pw("auditor123"), phone: "+2348012345682", role: "AUDITOR" },
      { email: "teacher@ffb.edu.ng", name: "Fatima Bello", password: await pw("teacher123"), phone: "+2348023456789", role: "TEACHER" },
      { email: "librarian@ffb.edu.ng", name: "Grace Nwosu", password: await pw("librarian123"), phone: "+2348012345683", role: "LIBRARIAN" },
      { email: "porter@ffb.edu.ng", name: "Ibrahim Musa", password: await pw("porter123"), phone: "+2348012345684", role: "PORTER" },
      { email: "parent@ffb.edu.ng", name: "Mrs. Ngozi Johnson", password: await pw("parent123"), phone: "+2348012345685", role: "PARENT" },
      { email: "alumni@ffb.edu.ng", name: "Emeka Obi", password: await pw("alumni123"), phone: "+2348012345686", role: "ALUMNI" },
      { email: "adebayo.johnson@student.ffb.edu.ng", name: "Adebayo Johnson", password: await pw("student123"), phone: "+2348034567890", role: "STUDENT" },
    ];

    const createdUsers: string[] = [];
    for (const a of accounts) {
      const existing = await prisma.user.findUnique({ where: { email: a.email } });
      let user;
      if (!existing) {
        user = await prisma.user.create({
          data: { email: a.email, name: a.name, password: a.password, phone: a.phone, schoolId: school.id },
        });
      } else {
        user = await prisma.user.update({ where: { id: existing.id }, data: { password: a.password } });
      }
      await prisma.userRole.upsert({
        where: { userId_roleId_schoolId: { userId: user.id, roleId: roles[a.role], schoolId: school.id } },
        update: {},
        create: { userId: user.id, roleId: roles[a.role], schoolId: school.id },
      });
      createdUsers.push(a.email);
    }

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
      message: "Database seeded successfully with all personas",
      users: createdUsers,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seeding failed", details: String(error) }, { status: 500 });
  }
}
