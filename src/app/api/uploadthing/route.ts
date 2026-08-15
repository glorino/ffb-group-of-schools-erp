import { createRouteHandler } from "uploadthing/next";
import { studentDocumentsRouter } from "@/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: studentDocumentsRouter,
});
