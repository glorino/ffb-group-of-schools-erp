import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    if (type === "all" || type === "students") {
      const students = await prisma.student.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { admissionNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true,
          class: { select: { displayName: true } },
          photo: true,
        },
        take: limit,
      });

      results.push(
        ...students.map((s) => ({
          id: s.id,
          type: "student" as const,
          title: `${s.firstName} ${s.lastName}`,
          subtitle: s.admissionNumber,
          extra: s.class?.displayName || "",
          photo: s.photo,
        }))
      );
    }

    if (type === "all" || type === "teachers") {
      const teachers = await prisma.teacher.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { employeeId: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          specialization: true,
          photo: true,
        },
        take: limit,
      });

      results.push(
        ...teachers.map((t) => ({
          id: t.id,
          type: "teacher" as const,
          title: `${t.firstName} ${t.lastName}`,
          subtitle: t.employeeId,
          extra: t.specialization || "",
          photo: t.photo,
        }))
      );
    }

    if (type === "all" || type === "applicants") {
      const applicants = await prisma.applicant.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { applicationNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          applicationNumber: true,
          classAppliedFor: true,
          status: true,
        },
        take: limit,
      });

      results.push(
        ...applicants.map((a) => ({
          id: a.id,
          type: "applicant" as const,
          title: `${a.firstName} ${a.lastName}`,
          subtitle: a.applicationNumber,
          extra: a.classAppliedFor,
          status: a.status,
        }))
      );
    }

    if (type === "all" || type === "fees") {
      const fees = await prisma.schoolFee.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          amount: true,
          type: true,
        },
        take: limit,
      });

      results.push(
        ...fees.map((f) => ({
          id: f.id,
          type: "fee" as const,
          title: f.name,
          subtitle: `₦${f.amount.toLocaleString()}`,
          extra: f.type,
        }))
      );
    }

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
