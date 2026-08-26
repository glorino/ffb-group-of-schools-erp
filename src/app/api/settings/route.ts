import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const body = await req.json();

    // Save school profile
    if (body.schoolProfile) {
      const school = await prisma.school.findFirst();
      if (school) {
        await prisma.school.update({
          where: { id: school.id },
          data: {
            name: body.schoolProfile.schoolName || school.name,
            email: body.schoolProfile.email || school.email,
            phone: body.schoolProfile.phone || school.phone,
            address: body.schoolProfile.address || school.address,
            city: body.schoolProfile.city || school.city,
            state: body.schoolProfile.state || school.state,
            country: body.schoolProfile.country || school.country,
            motto: body.schoolProfile.motto || school.motto,
          },
        });
      }
    }

    // Save academic year config
    if (body.academicYear) {
      const school = await prisma.school.findFirst();
      if (school) {
        const currentSettings = (school.settings as Record<string, any>) || {};
        await prisma.school.update({
          where: { id: school.id },
          data: { settings: { ...currentSettings, academicYear: body.academicYear } },
        });
      }
    }

    // Save grading config to GradingScale model
    if (body.gradingConfig && Array.isArray(body.gradingConfig)) {
      const school = await prisma.school.findFirst();
      if (school) {
        for (const grade of body.gradingConfig) {
          const existing = await prisma.gradingScale.findFirst({
            where: { schoolId: school.id, grade: grade.label },
          });
          if (existing) {
            await prisma.gradingScale.update({
              where: { id: existing.id },
              data: { minScore: grade.min, maxScore: grade.max, remark: grade.label, gpa: grade.gpa || 0 },
            });
          } else {
            await prisma.gradingScale.create({
              data: {
                schoolId: school.id,
                name: grade.label,
                grade: grade.label,
                minScore: grade.min,
                maxScore: grade.max,
                remark: grade.label,
                gpa: grade.gpa || 0,
              },
            });
          }
        }
      }
    }

    // Save notification settings
    if (body.notifications) {
      const school = await prisma.school.findFirst();
      if (school) {
        const currentSettings = (school.settings as Record<string, any>) || {};
        await prisma.school.update({
          where: { id: school.id },
          data: { settings: { ...currentSettings, notifications: body.notifications } },
        });
      }
    }

    // Save security settings (password policy, session policy, 2FA)
    if (body.passwordPolicy || body.sessionPolicy || body.twoFactorEnabled !== undefined) {
      const school = await prisma.school.findFirst();
      if (school) {
        const currentSettings = (school.settings as Record<string, any>) || {};
        const securitySettings: Record<string, any> = {};
        if (body.passwordPolicy) securitySettings.passwordPolicy = body.passwordPolicy;
        if (body.sessionPolicy) securitySettings.sessionPolicy = body.sessionPolicy;
        if (body.twoFactorEnabled !== undefined) securitySettings.twoFactorEnabled = body.twoFactorEnabled;
        await prisma.school.update({
          where: { id: school.id },
          data: { settings: { ...currentSettings, ...securitySettings } },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved" });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR"]);
    if (authResult.error) return authResult.error;

    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: "No school found" }, { status: 404 });
    }

    const gradingScales = await prisma.gradingScale.findMany({
      where: { schoolId: school.id },
      orderBy: { minScore: "desc" },
    });

    return NextResponse.json({
      success: true,
      settings: school.settings || {},
      schoolProfile: {
        schoolName: school.name,
        email: school.email,
        phone: school.phone,
        address: school.address,
        city: school.city,
        state: school.state,
        country: school.country,
        motto: school.motto,
      },
      gradingScales,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
