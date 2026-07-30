import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;
    const session = authResult.session;

    const body = await req.json();
    const { action, requestId, date, session: attendSession, classId, reason } = body;
    const userId = session!.user!.id!;

    if (action === "request") {
      const lagosTimeStr = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });
      const lagosDate = new Date(lagosTimeStr);
      const hour = lagosDate.getHours();
      const minute = lagosDate.getMinutes();
      const currentTime = hour * 60 + minute;
      const morningDeadline = 10 * 60;
      const afternoonDeadline = 13 * 60;

      if (attendSession === "morning" && currentTime >= morningDeadline) {
        return NextResponse.json({ error: "Attendance marking deadline has passed for this session" }, { status: 400 });
      }
      if (attendSession === "afternoon" && currentTime >= afternoonDeadline) {
        return NextResponse.json({ error: "Attendance marking deadline has passed for this session" }, { status: 400 });
      }

      const request = await prisma.attendanceUnlockRequest.create({
        data: {
          teacherId: userId,
          classId,
          date: new Date(date),
          session: attendSession,
          reason: reason || "Forgot to mark attendance",
          status: "pending",
        },
      });

      const admins = await prisma.user.findMany({
        where: {
          roles: { some: { role: { name: { in: ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "OWNER"] } } } },
        },
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "Attendance Unlock Request",
            message: `${session!.user!.name || "A teacher"} needs to mark ${attendSession} attendance for ${date}`,
            type: "system",
          },
        });
      }

      return NextResponse.json({ success: true, request, message: "Unlock request sent to administrators" });
    }

    if (action === "approve" || action === "reject") {
      const userRoles = await prisma.userRole.findMany({ where: { userId }, include: { role: true } });
      const isAdmin = userRoles.some(ur => ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "OWNER"].includes(ur.role.name));
      if (!isAdmin) return NextResponse.json({ error: "Only admins can approve unlock requests" }, { status: 403 });

      const request = await prisma.attendanceUnlockRequest.update({
        where: { id: requestId },
        data: { status: action === "approve" ? "approved" : "rejected", approvedBy: userId },
      });

      await prisma.notification.create({
        data: {
          userId: request.teacherId,
          title: `Attendance Unlock ${action === "approve" ? "Approved" : "Rejected"}`,
          message: `Your ${request.session} attendance request for ${new Date(request.date).toLocaleDateString()} has been ${action === "approve" ? "approved" : "rejected"}`,
          type: "system",
        },
      });

      return NextResponse.json({ success: true, request });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/attendance/unlock error:", error);
    return NextResponse.json({ error: "Failed to process unlock request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"]);
    if (authResult.error) return authResult.error;

    const requests = await prisma.attendanceUnlockRequest.findMany({
      include: { teacher: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("GET /api/attendance/unlock error:", error);
    return NextResponse.json({ error: "Failed to fetch unlock requests" }, { status: 500 });
  }
}
