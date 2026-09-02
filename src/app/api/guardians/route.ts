import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { GuardianSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { student: { firstName: { contains: search, mode: "insensitive" } } },
        { student: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const allGuardians = await prisma.guardian.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            class: { select: { name: true, displayName: true } },
          },
        },
      },
      orderBy: { firstName: "asc" },
    });

    // Group by unique parent (phone is the most reliable key, fallback to email+name)
    const parentMap = new Map<string, any>();
    for (const g of allGuardians) {
      const key = g.phone || `${g.email || ""}:${g.firstName}:${g.lastName}`;
      if (parentMap.has(key)) {
        const existing = parentMap.get(key);
        existing.students.push(g.student);
        existing.guardianIds.push(g.id);
        if (g.isPrimary) existing.isPrimary = true;
      } else {
        parentMap.set(key, {
          id: g.id,
          firstName: g.firstName,
          lastName: g.lastName,
          relationship: g.relationship,
          phone: g.phone,
          email: g.email,
          address: g.address,
          occupation: g.occupation,
          isPrimary: g.isPrimary,
          students: [g.student],
          guardianIds: [g.id],
        });
      }
    }

    const grouped = Array.from(parentMap.values());
    const total = grouped.length;
    const pages = Math.ceil(total / limit);
    const paginated = grouped.slice(skip, skip + limit);

    return NextResponse.json({
      guardians: paginated,
      pagination: { page, limit, total, pages },
    });
  } catch (error) {
    console.error("GET /api/guardians error:", error);
    return NextResponse.json({ error: "Failed to fetch guardians" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const validated = GuardianSchema.parse(body);
    const { studentId, firstName, lastName, phone, email, relationship, address, occupation } = validated;

    const guardian = await prisma.guardian.create({
      data: {
        studentId,
        firstName,
        lastName,
        phone,
        email: email || undefined,
        relationship: relationship || "parent",
        address: address || undefined,
        occupation: occupation || undefined,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, guardian }, { status: 201 });
  } catch (error) {
    console.error("POST /api/guardians error:", error);
    return NextResponse.json({ error: "Failed to create guardian" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, firstName, lastName, phone, email, relationship, address, occupation } = body;

    if (!id) {
      return NextResponse.json({ error: "Guardian ID is required" }, { status: 400 });
    }

    const guardian = await prisma.guardian.update({
      where: { id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        relationship: relationship || undefined,
        address: address || undefined,
        occupation: occupation || undefined,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, guardian });
  } catch (error) {
    console.error("PUT /api/guardians error:", error);
    return NextResponse.json({ error: "Failed to update guardian" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.guardian.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/guardians error:", error);
    return NextResponse.json({ error: "Failed to delete guardian" }, { status: 500 });
  }
}
