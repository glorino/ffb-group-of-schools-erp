import { generateReactHelpers } from "@uploadthing/react";
import type { StudentDocumentsRouter } from "@/uploadthing";

export const { useUploadThing } = generateReactHelpers<StudentDocumentsRouter>();
