import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schoolId = (session.user as any).schoolId as string | undefined;
  const where = schoolId ? { schoolId } : {};

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [
    totalStudents,
    totalTeachers,
    todayAttendance,
    totalRevenueResult,
    recentPayments,
    recentAdmissions,
    classes,
  ] = await Promise.all([
    prisma.student.count({ where: { ...where, status: "active" } }),
    prisma.teacher.count({ where: { ...where, status: "active" } }),
    prisma.attendanceRecord.groupBy({
      by: ["status"],
      where: {
        date: { gte: todayStart, lt: todayEnd },
        ...(schoolId ? { class: { schoolId } } : {}),
      },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { ...where, status: "completed" },
      _sum: { amount: true },
    }),
    prisma.payment.findMany({
      where: { ...where, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { student: { select: { firstName: true, lastName: true } } },
    }),
    prisma.applicant.findMany({
      where: { ...where },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        classAppliedFor: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.schoolClass.findMany({
      where: where,
      include: {
        _count: { select: { students: true } },
        classTeacher: { select: { name: true } },
      },
    }),
  ]);

  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const result = await prisma.payment.aggregate({
      where: {
        ...where,
        status: "completed",
        paidAt: { gte: start, lt: end },
      },
      _sum: { amount: true },
    });
    monthlyRevenue.push({
      month: start.toLocaleString("default", { month: "short", year: "numeric" }),
      revenue: result._sum.amount ?? 0,
    });
  }

  const attendanceMap: Record<string, number> = { present: 0, absent: 0, late: 0 };
  todayAttendance.forEach((a) => {
    attendanceMap[a.status] = a._count;
  });
  const totalAttendance = attendanceMap.present + attendanceMap.absent + attendanceMap.late;
  const attendanceRate = totalAttendance > 0 ? ((attendanceMap.present / totalAttendance) * 100).toFixed(1) : "0";

  const classPerformance = classes.map((c) => ({
    name: c.displayName,
    students: c._count.students,
    teacher: c.classTeacher?.name ?? "Unassigned",
    capacity: c.capacity,
  }));

  const recentActivities = [
    ...recentPayments.map((p) => ({
      title: "Payment received",
      description: `${p.student.firstName} ${p.student.lastName} paid ₦${p.amount.toLocaleString()}`,
      time: p.paidAt?.toISOString() ?? p.createdAt.toISOString(),
      type: "payment" as const,
    })),
    ...recentAdmissions.map((a) => ({
      title: "New application",
      description: `${a.firstName} ${a.lastName} applied for ${a.classAppliedFor}`,
      time: a.createdAt.toISOString(),
      type: "admission" as const,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  return NextResponse.json({
    totalStudents,
    totalTeachers,
    attendance: {
      present: attendanceMap.present,
      absent: attendanceMap.absent,
      late: attendanceMap.late,
      rate: attendanceRate,
    },
    totalRevenue: totalRevenueResult._sum.amount ?? 0,
    monthlyRevenue,
    classPerformance,
    recentActivities,
    pendingAdmissions: await prisma.applicant.count({
      where: { ...where, status: "pending" },
    }),
  });
}
