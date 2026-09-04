import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse(renderPage("Invalid", null, null, "Missing verification ID"), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        class: { select: { name: true } },
        school: {
          select: {
            name: true,
            address: true,
            phone: true,
            email: true,
            motto: true,
            logo: true,
            principalSignature: true,
          },
        },
        reportCards: {
          select: {
            id: true,
            academicYear: true,
            generatedAt: true,
            term: { select: { name: true } },
          },
          orderBy: { generatedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!student) {
      return new NextResponse(renderPage("Not Found", null, null, "Student not found"), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    return new NextResponse(renderPage("Valid", student, id, null), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch {
    return new NextResponse(renderPage("Error", null, null, "Verification failed"), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

function renderPage(
  status: "Valid" | "Not Found" | "Invalid" | "Error",
  student: any,
  transcriptId: string | null,
  errorMsg: string | null
) {
  const isValid = status === "Valid" && student;
  const schoolName = student?.school?.name || "School";
  const studentName = student ? `${student.firstName} ${student.lastName}` : "";
  const studentClass = student?.class?.name || "N/A";
  const studentNumber = student?.admissionNumber || "N/A";
  const schoolAddress = student?.school?.address || "";
  const schoolPhone = student?.school?.phone || "";
  const schoolEmail = student?.school?.email || "";
  const schoolMotto = student?.school?.motto || "";
  const schoolLogo = student?.school?.logo || "";

  const reportCards = student?.reportCards || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Transcript Verification - ${schoolName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f4f8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .container { max-width: 520px; width: 100%; background: #fff; border-radius: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0a2a6e, #0055ff); padding: 32px 24px; text-align: center; color: #fff; }
    .header img { width: 80px; height: 80px; border-radius: 16px; border: 3px solid rgba(255,255,255,0.3); margin-bottom: 12px; object-fit: contain; background: #fff; }
    .header h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 12px; opacity: 0.85; }
    .badge { display: inline-block; padding: 8px 24px; border-radius: 24px; font-size: 13px; font-weight: 700; margin-top: 12px; }
    .badge-valid { background: #d1fae5; color: #065f46; }
    .badge-invalid { background: #fee2e2; color: #991b1b; }
    .body { padding: 24px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .info-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-value { font-size: 14px; font-weight: 600; color: #0f172a; }
    .reports { margin-top: 20px; }
    .reports h3 { font-size: 14px; color: #475569; margin-bottom: 12px; }
    .report-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 6px; font-size: 13px; }
    .report-term { font-weight: 600; color: #0f172a; }
    .report-date { color: #94a3b8; }
    .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; }
    .footer p { font-size: 11px; color: #94a3b8; line-height: 1.5; }
    .motto { font-style: italic; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${schoolLogo ? `<img src="${schoolLogo}" alt="School Logo" />` : `<div style="width:80px;height:80px;border-radius:16px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:28px;font-weight:800;border:3px solid rgba(255,255,255,0.3)">${schoolName.charAt(0)}</div>`}
      <h1>${schoolName}</h1>
      <p>Academic Transcript Verification</p>
      <div class="badge ${isValid ? "badge-valid" : "badge-invalid"}">
        ${isValid ? "✓ VERIFIED" : "✗ NOT VERIFIED"}
      </div>
    </div>
    <div class="body">
      ${isValid ? `
        ${transcriptId ? `<div class="info-row"><span class="info-label">Transcript ID</span><span class="info-value" style="color:#0055ff">TRN-${student.id.slice(-8).toUpperCase()}</span></div>` : ""}
        <div class="info-row"><span class="info-label">Student Name</span><span class="info-value">${studentName}</span></div>
        <div class="info-row"><span class="info-label">Student Number</span><span class="info-value">${studentNumber}</span></div>
        <div class="info-row"><span class="info-label">Class</span><span class="info-value">${studentClass}</span></div>
        ${reportCards.length > 0 ? `
          <div class="reports">
            <h3>Academic Records</h3>
            ${reportCards.map((rc: any) => `
              <div class="report-item">
                <span class="report-term">${rc.term?.name || "Term"} - ${rc.academicYear}</span>
                <span class="report-date">Generated: ${new Date(rc.generatedAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            `).join("")}
          </div>
        ` : "<p style='text-align:center;color:#94a3b8;margin-top:16px'>No report cards found</p>"}
      ` : `
        <div style="text-align:center;padding:24px 0">
          <p style="font-size:16px;color:#94a3b8">${errorMsg || "This transcript could not be verified."}</p>
        </div>
      `}
    </div>
    <div class="footer">
      <p>This verification was generated automatically by the school&apos;s official records system.</p>
      ${schoolMotto ? `<p class="motto">&ldquo;${schoolMotto}&rdquo;</p>` : ""}
      <p style="margin-top:8px">${schoolAddress ? `${schoolAddress} • ` : ""}${schoolPhone ? `${schoolPhone} • ` : ""}${schoolEmail || ""}</p>
    </div>
  </div>
</body>
</html>`;
}
