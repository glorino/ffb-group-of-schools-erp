import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ credentials: [] });
    }

    const users = await prisma.user.findMany({
      select: { email: true, name: true, roles: { select: { role: { select: { name: true } } } } },
      take: 12,
    });

    const credentials = users
      .filter((u) => u.roles.length > 0)
      .map((u) => ({
        role: u.roles[0].role.name.charAt(0) + u.roles[0].role.name.slice(1).toLowerCase().replace("_", " "),
        email: u.email,
        password: "demo-access",
      }));

    return NextResponse.json({ credentials });
  } catch {
    return NextResponse.json({ credentials: [] });
  }
}
