const routeRoles: Record<string, string[]> = {
  "/dashboard": [],
  "/dashboard/analytics": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "ACCOUNTANT", "AUDITOR"],
  "/dashboard/students": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/dashboard/teachers": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/dashboard/classes": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
  "/dashboard/attendance": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "PARENT", "STUDENT"],
  "/dashboard/exams": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT"],
  "/dashboard/timetable": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/dashboard/lesson-plans": ["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/dashboard/results": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/dashboard/report-cards": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/dashboard/transcript": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/dashboard/admissions": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  "/dashboard/finance": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT", "AUDITOR", "STUDENT", "PARENT"],
  "/dashboard/payments": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT"],
  "/dashboard/income": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"],
  "/dashboard/expenses": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"],
  "/dashboard/payroll": ["OWNER", "ADMINISTRATOR", "ACCOUNTANT"],
  "/dashboard/library": ["OWNER", "ADMINISTRATOR", "LIBRARIAN", "TEACHER", "STUDENT", "PARENT"],
  "/dashboard/hostel": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "PORTER"],
  "/dashboard/transport": ["OWNER", "ADMINISTRATOR", "PRINCIPAL"],
  "/dashboard/clinic": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER"],
  "/dashboard/inventory": ["OWNER", "ADMINISTRATOR"],
  "/dashboard/ai": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "AUDITOR"],
  "/dashboard/alumni": ["OWNER", "ADMINISTRATOR", "ALUMNI"],
  "/dashboard/announcements": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"],
  "/dashboard/calendar": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"],
  "/dashboard/notifications": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI", "ACCOUNTANT", "AUDITOR", "LIBRARIAN", "PORTER"],
  "/dashboard/settings": ["OWNER", "ADMINISTRATOR"],
  "/dashboard/profile": [],
  "/dashboard/students/[id]": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"],
  "/dashboard/students/[id]/payment-history": ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT", "STUDENT", "PARENT"],
};

export function canAccessRoute(pathname: string, userRoles: string[]): boolean {
  if (userRoles.includes("OWNER")) return true;

  const exactMatch = routeRoles[pathname];
  if (exactMatch !== undefined) {
    if (exactMatch.length === 0) return true;
    return exactMatch.some(r => userRoles.includes(r));
  }

  for (const [route, roles] of Object.entries(routeRoles)) {
    if (pathname.startsWith(route + "/")) {
      if (roles.length === 0) return true;
      return roles.some(r => userRoles.includes(r));
    }
  }

  return true;
}

export function getDefaultRoute(userRoles: string[]): string {
  if (userRoles.includes("OWNER") || userRoles.includes("ADMINISTRATOR")) return "/dashboard";
  if (userRoles.includes("PRINCIPAL") || userRoles.includes("VICE_PRINCIPAL")) return "/dashboard";
  if (userRoles.includes("TEACHER")) return "/dashboard";
  if (userRoles.includes("ACCOUNTANT") || userRoles.includes("AUDITOR")) return "/dashboard/finance";
  if (userRoles.includes("LIBRARIAN")) return "/dashboard/library";
  if (userRoles.includes("PORTER")) return "/dashboard/hostel";
  if (userRoles.includes("PARENT")) return "/dashboard";
  if (userRoles.includes("STUDENT")) return "/dashboard";
  if (userRoles.includes("ALUMNI")) return "/dashboard/alumni";
  return "/dashboard";
}
