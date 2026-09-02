import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["PARENT"]);
    if (authResult.error) return authResult.error;

    const email = authResult.session!.user.email;
    if (!email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    const guardians = await prisma.guardian.findMany({
      where: { email },
      include: {
        student: {
          include: {
            invoices: {
              orderBy: { createdAt: "desc" },
              include: {
                schoolFee: true,
                payments: { where: { status: "completed" } },
              },
            },
          },
        },
      },
    });

    const children = guardians.map(g => g.student).filter(Boolean);

    const result = children.map(student => {
      const totalPaid = student.invoices.reduce((sum, inv) => {
        const paid = inv.payments.reduce((p, pay) => p + pay.amount, 0);
        return sum + paid;
      }, 0);
      const totalOwed = student.invoices
        .filter(inv => inv.status !== "paid")
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        className: student.classId,
        invoices: student.invoices.map(inv => ({
          id: inv.id,
          title: inv.schoolFee?.name || inv.invoiceNumber,
          amount: inv.totalAmount,
          status: inv.status,
          dueDate: inv.dueDate,
          term: inv.schoolFee?.term || "",
          session: inv.schoolFee?.academicYear || "",
          paid: inv.payments.reduce((p, pay) => p + pay.amount, 0),
        })),
        totalPaid,
        totalOwed,
      };
    });

    return NextResponse.json({ children: result });
  } catch (error) {
    console.error("GET /api/parent/invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
