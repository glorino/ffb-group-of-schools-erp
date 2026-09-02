import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { SCHOOL_CONFIG } from "@/lib/school-config";

export interface NotifyParentOptions {
  studentId: string;
  subject: string;
  html: string;
}

export async function notifyParents(options: NotifyParentOptions): Promise<void> {
  const { studentId, subject, html } = options;

  try {
    const guardians = await prisma.guardian.findMany({
      where: { studentId, email: { not: null } },
      select: { email: true },
    });

    const guardianEmails = guardians.map(g => g.email).filter((e): e is string => Boolean(e));

    if (guardianEmails.length === 0) return;

    await sendEmail(guardianEmails, subject, html);
  } catch (error) {
    console.error("Failed to notify parents:", error);
  }
}

export function buildParentEmail(options: {
  title: string;
  studentName: string;
  message: string;
  details?: Record<string, string>;
  actionLabel?: string;
  actionUrl?: string;
  color?: string;
}): string {
  const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
  const { title, studentName, message, details, actionLabel, actionUrl, color = "#0055ff" } = options;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, ${color}, ${color}dd); padding: 30px; text-align: center;">
        <h1 style="font-size: 22px; font-weight: 700; margin: 0;">${title}</h1>
      </div>
      <div style="padding: 30px;">
        <p style="color: rgba(255,255,255,0.7); line-height: 1.7;">Dear Parent/Guardian,</p>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.7; margin-top: 15px;">
          ${message.replace("{student}", `<strong>${studentName}</strong>`)}
        </p>
        ${details ? `
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 20px 0;">
            ${Object.entries(details).map(([key, value]) => `
              <p style="color: rgba(255,255,255,0.7); margin: 5px 0;"><strong>${key}:</strong> ${value}</p>
            `).join("")}
          </div>
        ` : ""}
        ${actionLabel && actionUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background: linear-gradient(135deg, ${color}, ${color}dd); color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block;">${actionLabel}</a>
          </div>
        ` : ""}
        <p style="color: rgba(255,255,255,0.5); margin-top: 20px;">Warm regards,<br/><strong>${schoolName} Administration</strong></p>
      </div>
    </div>
  `;
}
