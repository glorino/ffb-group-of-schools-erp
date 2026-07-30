import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getDefaultSchoolId } from "@/lib/school";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const schoolId = await getDefaultSchoolId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        schoolId,
      },
    });

    const roleName = role === "teacher" ? "TEACHER" : role === "accountant" ? "ACCOUNTANT" : "ADMINISTRATOR";
    const roleRecord = await prisma.role.findUnique({ where: { name: roleName } });
    if (roleRecord) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: roleRecord.id, schoolId },
      });
    }

    return NextResponse.json({ success: true, message: "Account created", userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
