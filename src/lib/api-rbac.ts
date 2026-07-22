import { auth } from "@/auth";
import { NextResponse } from "next/server";

const apiRoleRoutes: Record<string, string[]> = {
  "/api/students": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
  "/api/teachers": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/api/classes": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
  "/api/attendance": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/api/exams": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT"],
  "/api/grades": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/api/announcements": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"],
  "/api/payroll": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT"],
  "/api/expenses": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"],
  "/api/income": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"],
  "/api/finance": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT", "AUDITOR", "STUDENT", "PARENT"],
  "/api/library": ["OWNER", "ADMINISTRATOR", "LIBRARIAN", "TEACHER", "STUDENT", "PARENT"],
  "/api/hostel": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "PORTER"],
  "/api/transport": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/api/clinic": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
  "/api/inventory": ["OWNER", "ADMINISTRATOR"],
  "/api/admissions": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/api/notifications": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI", "ACCOUNTANT", "AUDITOR", "LIBRARIAN", "PORTER"],
  "/api/users": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT", "AUDITOR", "LIBRARIAN", "PORTER", "ALUMNI"],
  "/api/timetable": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/api/lesson-plans": ["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/api/dashboard": [],
  "/api/children": ["PARENT", "STUDENT"],
  "/api/reports": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/api/subject": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
};

export async function requireAuth(requiredRoles?: string[]) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null, userRoles: [] as string[] };
  }
  const userRoles: string[] = (session.user as any)?.roles?.map((r: any) => r.name) || [];

  if (userRoles.includes("OWNER")) {
    return { error: null, session, userRoles };
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!userRoles.some(r => requiredRoles.includes(r))) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null, userRoles };
    }
  }
  return { error: null, session, userRoles };
}

export function getRolesForApiPath(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(apiRoleRoutes)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return roles;
    }
  }
  return null;
}
