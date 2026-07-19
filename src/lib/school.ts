import { prisma } from "./prisma";

let cachedSchoolId: string | null = null;

export async function getDefaultSchoolId(): Promise<string> {
  if (cachedSchoolId) return cachedSchoolId;

  const school = await prisma.school.findFirst({
    where: { slug: "ffb-main" },
    select: { id: true },
  });

  if (!school) {
    throw new Error("Default school not found. Run seed first.");
  }

  cachedSchoolId = school.id;
  return school.id;
}
