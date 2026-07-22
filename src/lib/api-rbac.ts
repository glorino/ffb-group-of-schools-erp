import { auth } from "@/auth";
import { NextResponse } from "next/server";

const apiRoleRoutes: Record<string, string[]> = {
  "/api/students": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
  "/api/teachers": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/api/classes": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
  "/api/attendance": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/api/exams": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER"],
  "/api/grades": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER"],
  "/api/announcements": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"],
  "/api/payroll": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT"],
  "/api/expenses": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"],
  "/api/income": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"],
  "/api/finance": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT", "AUDITOR"],
  "/api/library": ["OWNER", "ADMINISTRATOR", "LIBRARIAN", "TEACHER", "STUDENT"],
  "/api/hostel": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "PORTER"],
  "/api/transport": ["OWNER", "ADMINISTRATOR", "PRINCIPAL"],
  "/api/clinic": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER"],
  "/api/inventory": ["OWNER", "ADMINISTRATOR"],
  "/api/admissions": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/api/notifications": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI", "ACCOUNTANT", "AUDITOR", "LIBRARIAN", "PORTER"],
  "/api/users": ["OWNER", "ADMINISTRATOR"],
  "/api/timetable": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/api/lesson-plans": ["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/api/dashboard": [],
  "/api/children": ["PARENT", "STUDENT"],
};

export async function requireAuth(requiredRoles?: string[]) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null, userRoles: [] };
  }
  const userRoles: string[] = (session.user as any)?.roles?.map((r: any) => r.name) || [];
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
