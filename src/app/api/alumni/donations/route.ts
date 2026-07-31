import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["ALUMNI", "OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;

    const where: any = {};
    const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
    if (userRoles.includes("ALUMNI")) {
      where.alumni = { userId: (session?.user as any)?.id };
    }

    const donations = await prisma.alumniDonation.findMany({
      where,
      include: {
        alumni: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { donatedAt: "desc" },
    });

    return NextResponse.json({ success: true, donations });
  } catch (error) {
    console.error("GET /api/alumni/donations error:", error);
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["ALUMNI", "OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;
    const { session } = authResult;

    const body = await request.json();
    const { alumniId, amount, purpose } = body;

    if (!alumniId || !amount || amount <= 0) {
      return NextResponse.json({ error: "alumniId and a valid amount are required" }, { status: 400 });
    }

    const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
    if (userRoles.includes("ALUMNI")) {
      const alumni = await prisma.alumni.findUnique({ where: { userId: (session?.user as any)?.id } });
      if (!alumni || alumni.id !== alumniId) {
        return NextResponse.json({ error: "You can only create donations for your own profile" }, { status: 403 });
      }
    }

    const reference = "DON-" + Date.now();

    const donation = await prisma.alumniDonation.create({
      data: {
        alumniId,
        amount: parseFloat(amount),
        purpose: purpose || undefined,
        reference,
        status: "completed",
      },
      include: {
        alumni: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json({ success: true, donation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/alumni/donations error:", error);
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 });
  }
}
