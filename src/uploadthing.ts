import { createUploadthing } from "uploadthing/server";
import type { FileRouter } from "uploadthing/types";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const studentDocumentsRouter = {
  document: f({
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "16MB" },
  })
    .input(
      z.object({
        studentId: z.string().min(1, "Student ID required"),
      })
    )
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user) {
        throw new Error("Unauthorized");
      }
      const userRoles: string[] =
        (session.user as any)?.roles?.map((r: any) => r.name) || [];
      const allowed = ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"];
      if (!userRoles.some((r) => allowed.includes(r))) {
        throw new Error("Forbidden");
      }

      const student = await prisma.student.findUnique({
        where: { id: input.studentId },
        select: { id: true },
      });
      if (!student) throw new Error("Student not found");

      return { studentId: input.studentId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.studentDocument.create({
        data: {
          studentId: metadata.studentId,
          name: file.name,
          type: file.type || "application/octet-stream",
          url: file.url,
          size: file.size,
        },
      });
      return { studentId: metadata.studentId, url: file.url };
    }),
} satisfies FileRouter;

export type StudentDocumentsRouter = typeof studentDocumentsRouter;

import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing } = generateReactHelpers<StudentDocumentsRouter>();
