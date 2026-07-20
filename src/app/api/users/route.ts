import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.roles = { some: { role: { name: role } } };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        roles: { include: { role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { email, name, password, phone, role, schoolId } = body;

    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: "Missing required fields: email, name, password, role" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userSchoolId = schoolId || (session.user as any).schoolId;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone: phone || undefined,
        schoolId: userSchoolId,
      },
    });

    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (roleRecord) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: roleRecord.id,
          schoolId: userSchoolId,
        },
      });
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, name, email, phone, password } = body;

    if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("PUT /api/users error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
