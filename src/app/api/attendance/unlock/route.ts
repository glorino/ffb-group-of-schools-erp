import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST - Request attendance unlock (teacher) or approve unlock (admin/principal)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, requestId, date, session: attendSession, classId, reason } = body;
  const userId = session.user.id!;

  // Teacher requesting unlock
  if (action === "request") {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;
    const morningDeadline = 10 * 60; // 10:00 AM
    const afternoonDeadline = 13 * 60; // 1:00 PM

    // Check if attendance is still within allowed time
    if (attendSession === "morning" && currentTime <= morningDeadline) {
      return NextResponse.json({ error: "Morning attendance is still open. Mark it directly." }, { status: 400 });
    }
    if (attendSession === "afternoon" && currentTime <= afternoonDeadline) {
      return NextResponse.json({ error: "Afternoon attendance is still open. Mark it directly." }, { status: 400 });
    }

    // Create unlock request
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

    // Notify admins/principals
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
          message: `${session.user.name || "A teacher"} needs to mark ${attendSession} attendance for ${date}`,
          type: "system",
        },
      });
    }

    return NextResponse.json({ success: true, request, message: "Unlock request sent to administrators" });
  }

  // Admin approving/rejecting unlock
  if (action === "approve" || action === "reject") {
    const userRoles = await prisma.userRole.findMany({ where: { userId }, include: { role: true } });
    const isAdmin = userRoles.some(ur => ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "OWNER"].includes(ur.role.name));
    if (!isAdmin) return NextResponse.json({ error: "Only admins can approve unlock requests" }, { status: 403 });

    const request = await prisma.attendanceUnlockRequest.update({
      where: { id: requestId },
      data: { status: action === "approve" ? "approved" : "rejected", approvedBy: userId },
    });

    // Notify requesting teacher
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
}

// GET - List unlock requests
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.attendanceUnlockRequest.findMany({
    include: { teacher: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ requests });
}