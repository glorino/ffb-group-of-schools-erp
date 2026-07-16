import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, password: true },
      take: 5,
    });

    const roleCount = await prisma.role.count();
    const schoolCount = await prisma.school.count();

    const results = [];
    for (const u of users) {
      let passwordValid = false;
      try {
        passwordValid = await bcrypt.compare("admin123", u.password || "");
      } catch {}
      results.push({ email: u.email, name: u.name, hasPassword: !!u.password, passwordTestAdmin123: passwordValid });
    }

    return NextResponse.json({
      ok: true,
      userCount,
      roleCount,
      schoolCount,
      users: results,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      code: error.code,
    }, { status: 500 });
  }
}