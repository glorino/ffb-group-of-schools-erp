import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET() {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const roles = await prisma.role.findMany({
      orderBy: { level: "desc" },
      include: { _count: { select: { users: true } } },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("GET /api/roles error:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const body = await req.json();
    const { name, description, level } = body;

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Role already exists" }, { status: 409 });
    }

    const role = await prisma.role.create({
      data: { name, description, level: level || 0 },
    });

    return NextResponse.json({ success: true, role }, { status: 201 });
  } catch (error) {
    console.error("POST /api/roles error:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
