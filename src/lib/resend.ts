import { SCHOOL_CONFIG } from "@/lib/school-config";

const RESEND_BASE_URL = "https://api.resend.com";

function getApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return apiKey;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@ffb.edu.ng";
const FROM_NAME = process.env.RESEND_FROM_NAME || SCHOOL_CONFIG.name;

export interface EmailResponse {
  id: string;
}

export interface BulkEmailResponse {
  id: string;
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<EmailResponse> {
  const apiKey = getApiKey();
  const recipients = Array.isArray(to) ? to : [to];

  const response = await fetch(`${RESEND_BASE_URL}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipients,
      subject,
      html,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send email");
  }

  return result as EmailResponse;
}

export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string
): Promise<BulkEmailResponse> {
  const apiKey = getApiKey();

  const response = await fetch(`${RESEND_BASE_URL}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipients,
      subject,
      html,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send bulk email");
  }

  return result as BulkEmailResponse;
}

export async function sendWelcomeEmail(
  name: string,
  email: string,
  role: string
): Promise<EmailResponse> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
        .content { padding: 30px; }
        .content h2 { color: #1e3a8a; margin: 0 0 16px; font-size: 20px; }
        .content p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
        .badge { display: inline-block; background: #dbeafe; color: #1e3a8a; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 13px; text-transform: uppercase; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${SCHOOL_CONFIG.name}</h1>
          <p>Welcome to our School ERP System</p>
        </div>
        <div class="content">
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been successfully created. We're excited to have you on board.</p>
          <p><span class="badge">${role}</span></p>
          <p>You can now log in to access the system using your registered email address. If you have any questions, please don't hesitate to reach out to our support team.</p>
          <p>Thank you for choosing ${SCHOOL_CONFIG.name}!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${SCHOOL_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, `Welcome to ${SCHOOL_CONFIG.name}`, html);
}

export async function sendPaymentReceipt(
  name: string,
  email: string,
  amount: number,
  reference: string
): Promise<EmailResponse> {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; }
        .receipt-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 24px; text-align: center; margin: 16px 0; }
        .receipt-box .amount { font-size: 32px; font-weight: 700; color: #16a34a; margin: 0; }
        .receipt-box .label { color: #166534; font-size: 14px; margin: 4px 0 0; }
        .details { margin: 20px 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .details td:first-child { color: #64748b; font-size: 14px; }
        .details td:last-child { color: #1e293b; font-weight: 500; text-align: right; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Your payment has been successfully processed. Please find the details below:</p>
          <div class="receipt-box">
            <p class="amount">${formattedAmount}</p>
            <p class="label">Amount Paid</p>
          </div>
          <div class="details">
            <table>
              <tr><td>Student Name</td><td>${name}</td></tr>
              <tr><td>Reference</td><td>${reference}</td></tr>
              <tr><td>Amount</td><td>${formattedAmount}</td></tr>
              <tr><td>Date</td><td>${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
              <tr><td>Status</td><td style="color: #16a34a; font-weight: 600;">Completed</td></tr>
            </table>
          </div>
          <p>This receipt serves as proof of payment. Please keep it for your records.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${SCHOOL_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, `Payment Receipt - ${reference}`, html);
}

export async function sendPasswordResetEmail(
  name: string,
  email: string,
  resetToken: string
): Promise<EmailResponse> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ffb-erp.vercel.app"}/auth/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; }
        .content h2 { color: #1e293b; margin: 0 0 16px; font-size: 20px; }
        .content p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello, ${name}!</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="btn">Reset Password</a>
          <p>If you didn't request this, please ignore this email. The link expires in 1 hour.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${SCHOOL_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, `Password Reset - ${SCHOOL_CONFIG.name}`, html);
}

export async function sendAdmissionLetter(
  name: string,
  email: string,
  admissionNumber: string,
  className: string
): Promise<EmailResponse> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
        .content { padding: 30px; }
        .content h2 { color: #1e3a8a; margin: 0 0 16px; font-size: 20px; }
        .content p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
        .info-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .info-box p { margin: 4px 0; color: #1e40af; }
        .info-box strong { color: #1e3a8a; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${SCHOOL_CONFIG.name}</h1>
          <p>Admission Offer</p>
        </div>
        <div class="content">
          <h2>Congratulations, ${name}!</h2>
          <p>We are pleased to inform you that you have been offered admission into ${SCHOOL_CONFIG.name}. Below are your admission details:</p>
          <div class="info-box">
            <p><strong>Student Name:</strong> ${name}</p>
            <p><strong>Admission Number:</strong> ${admissionNumber}</p>
            <p><strong>Class:</strong> ${className}</p>
            <p><strong>Academic Session:</strong> ${new Date().getFullYear()}/${new Date().getFullYear() + 1}</p>
          </div>
          <p>Please report to the school administrative office with the following documents within two weeks of receiving this letter:</p>
          <p>1. Birth Certificate<br>2. Previous school report/card<br>3. Medical fitness certificate<br>4. Passport photographs (4 copies)<br>5. Parent/Guardian ID</p>
          <p>We look forward to welcoming you to our school community!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${SCHOOL_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, `Admission Letter - ${SCHOOL_CONFIG.name}`, html);
}

export async function sendAbsenceNotification(
  parentName: string,
  parentEmail: string,
  studentName: string,
  date: string
): Promise<EmailResponse> {
  const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
  const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
  const schoolPhone = process.env.SCHOOL_PHONE || SCHOOL_CONFIG.phone;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; }
        .content h2 { color: #1e293b; margin: 0 0 16px; font-size: 20px; }
        .content p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
        .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .alert-box p { margin: 4px 0; color: #7f1d1d; }
        .alert-box strong { color: #991b1b; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${schoolName}</h1>
        </div>
        <div class="content">
          <h2>Attendance Alert</h2>
          <p>Dear ${parentName},</p>
          <p>We wish to inform you that <strong>${studentName}</strong> was marked <strong>absent</strong> from school on <strong>${date}</strong>.</p>
          <div class="alert-box">
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Status:</strong> Absent</p>
          </div>
          <p>If this absence was excused or due to a valid reason, please contact the school administration to update the record.</p>
          <p>For enquiries, contact us at <a href="mailto:${schoolEmail}" style="color: #dc2626;">${schoolEmail}</a> or call <strong>${schoolPhone}</strong>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(parentEmail, `Absence Notification - ${studentName} (${date})`, html);
}

export interface ApplicantForEmail {
  firstName: string;
  lastName: string;
  applicationNumber: string;
  classAppliedFor: string;
  email: string;
  guardianName?: string | null;
  guardianEmail?: string | null;
  guardianPhone?: string | null;
}

export async function sendApplicationSubmittedEmail(
  applicantData: ApplicantForEmail
): Promise<EmailResponse | null> {
  const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
  const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
  const schoolPhone = process.env.SCHOOL_PHONE || SCHOOL_CONFIG.phone;
  if (!process.env.RESEND_API_KEY) return null;

  const fullName = `${applicantData.firstName} ${applicantData.lastName}`;
  const recipients = [applicantData.email, applicantData.guardianEmail].filter(Boolean);
  if (recipients.length === 0) return null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 640px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0039a6 0%, #0055ff 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 26px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
        .content { padding: 32px; }
        .content h2 { color: #1e3a8a; margin: 0 0 20px; font-size: 22px; font-weight: 600; }
        .content p { color: #475569; line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #0055ff; padding: 20px 24px; border-radius: 0 8px 8px 0; margin: 20px 0; }
        .info-box p { margin: 6px 0; color: #0c4a6e; font-size: 14px; }
        .info-box strong { color: #0039a6; font-weight: 600; }
        .btn { display: inline-block; background: #0055ff; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${schoolName}</h1>
          <p>Application Received</p>
        </div>
        <div class="content">
          <h2>Thank you for your application</h2>
          <p>Dear ${fullName},</p>
          <p>We have received your admission application to ${schoolName}. Your application is being reviewed by our admissions team.</p>
          <div class="info-box">
            <p><strong>Application Number:</strong> ${applicantData.applicationNumber}</p>
            <p><strong>Student Name:</strong> ${fullName}</p>
            <p><strong>Class Applied For:</strong> ${applicantData.classAppliedFor}</p>
            ${applicantData.guardianName ? `<p><strong>Guardian:</strong> ${applicantData.guardianName}</p>` : ""}
          </div>
          <p><strong>What happens next?</strong></p>
          <p>Your application will go through the following stages: review, entrance examination, and interview. We will notify you of each status change via email.</p>
          <p>You can also track your application status at any time using your application number.</p>
          <p>For enquiries, contact us at <a href="mailto:${schoolEmail}" style="color: #0055ff;">${schoolEmail}</a> or call <strong>${schoolPhone}</strong>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const toEmails = recipients.filter((r): r is string => Boolean(r));
  return sendEmail(toEmails, `Application Received - ${schoolName} (${applicantData.applicationNumber})`, html);
}

export async function sendApplicationStatusUpdateEmail(
  applicantData: ApplicantForEmail,
  newStatus: string,
  note?: string
): Promise<EmailResponse | null> {
  const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
  const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
  const schoolPhone = process.env.SCHOOL_PHONE || SCHOOL_CONFIG.phone;
  if (!process.env.RESEND_API_KEY) return null;

  const fullName = `${applicantData.firstName} ${applicantData.lastName}`;
  const recipients = [applicantData.email, applicantData.guardianEmail].filter(Boolean);
  if (recipients.length === 0) return null;

  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    under_review: {
      title: "Application Under Review",
      message: "Your application is now under review by our admissions team.",
      color: "#0055ff",
    },
    exam: {
      title: "Entrance Examination Scheduled",
      message: "Your application has progressed to the entrance examination stage. Details of the exam will be communicated separately.",
      color: "#7c3aed",
    },
    interview: {
      title: "Interview Scheduled",
      message: "Your application has progressed to the interview stage. An interview date has been scheduled.",
      color: "#0d9488",
    },
  };

  const statusInfo = statusMessages[newStatus] || {
    title: "Application Status Update",
    message: `Your application status has been updated to: ${newStatus}.`,
    color: "#6b7280",
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 640px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 26px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
        .content { padding: 32px; }
        .content h2 { color: #1e3a8a; margin: 0 0 20px; font-size: 22px; font-weight: 600; }
        .content p { color: #475569; line-height: 1.7; margin: 0 0 16px; font-size: 15px; }
        .info-box { background: #f0f9ff; border-left: 4px solid ${statusInfo.color}; padding: 20px 24px; border-radius: 0 8px 8px 0; margin: 20px 0; }
        .info-box p { margin: 6px 0; color: #0c4a6e; font-size: 14px; }
        .info-box strong { color: #0039a6; font-weight: 600; }
        .note-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .note-box p { margin: 0; color: #78350f; font-size: 14px; }
        .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${schoolName}</h1>
          <p>${statusInfo.title}</p>
        </div>
        <div class="content">
          <h2>${statusInfo.title}</h2>
          <p>Dear ${fullName},</p>
          <p>${statusInfo.message}</p>
          <div class="info-box">
            <p><strong>Application Number:</strong> ${applicantData.applicationNumber}</p>
            <p><strong>Student Name:</strong> ${fullName}</p>
            <p><strong>Current Status:</strong> ${newStatus}</p>
            ${applicantData.guardianName ? `<p><strong>Guardian:</strong> ${applicantData.guardianName}</p>` : ""}
          </div>
          ${note ? `<div class="note-box"><p><strong>Admissions Note:</strong> ${note}</p></div>` : ""}
          <p>For enquiries, contact us at <a href="mailto:${schoolEmail}" style="color: #0055ff;">${schoolEmail}</a> or call <strong>${schoolPhone}</strong>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `${statusInfo.title} - ${schoolName} (${applicantData.applicationNumber})`;
  const toEmails = recipients.filter((r): r is string => Boolean(r));
  return sendEmail(toEmails, subject, html);
}

export async function sendEntranceExamEmail(params: {
  firstName: string;
  lastName: string;
  applicationNumber: string;
  classAppliedFor: string;
  email: string;
  guardianName?: string;
  guardianEmail?: string;
  examDate: Date;
  startTime: string;
  endTime: string;
  durationMins: number;
  examUrl: string;
}) {
  const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
  const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
  const schoolPhone = process.env.SCHOOL_PHONE || SCHOOL_CONFIG.phone;

  const fullName = `${params.firstName} ${params.lastName}`;
  const examDateStr = params.examDate.toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;">
      <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0a2a6e,#0055ff);padding:36px 32px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">${schoolName}</h1>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Entrance Examination Invitation</p>
        </div>
        <div style="padding:32px;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#0055ff,#0033cc);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">📝</div>
            <h2 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">Entrance Examination</h2>
            <p style="margin:6px 0 0;font-size:14px;color:#64748b;">You have been invited to take the entrance examination</p>
          </div>

          <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:20px;">
            Dear <strong>${fullName}</strong>,
          </p>
          <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:24px;">
            Congratulations! Your application (<strong>${params.applicationNumber}</strong>) has been reviewed and you have been invited to take the entrance examination for admission into <strong>${params.classAppliedFor}</strong>.
          </p>

          <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
            <h3 style="margin:0 0 14px;font-size:14px;font-weight:700;color:#0f172a;">📋 Exam Details</h3>
            <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:8px 0;font-weight:600;width:40%;">Date</td><td style="padding:8px 0;">${examDateStr}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Time</td><td style="padding:8px 0;border-top:1px solid #e5e7eb;">${params.startTime} - ${params.endTime}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Duration</td><td style="padding:8px 0;border-top:1px solid #e5e7eb;">${params.durationMins} minutes</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Subjects</td><td style="padding:8px 0;border-top:1px solid #e5e7eb;">Mathematics, English Language, Science</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Format</td><td style="padding:8px 0;border-top:1px solid #e5e7eb;">Multiple Choice Questions (MCQ)</td></tr>
            </table>
          </div>

          <div style="background:linear-gradient(135deg,#0a2a6e,#0055ff);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.05em;">Your Exam Link</p>
            <a href="${params.examUrl}" style="display:inline-block;background:#fff;color:#0055ff;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;transition:all 0.15s;">Start Examination →</a>
            <p style="margin:10px 0 0;font-size:11px;color:rgba(255,255,255,0.6);">This link is unique to you. Do not share it with anyone.</p>
          </div>

          <div style="background:#fef3c7;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid #fbbf24;">
            <h4 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#92400e;">⚠️ Important Instructions</h4>
            <ul style="margin:0;padding-left:18px;font-size:12px;color:#92400e;line-height:1.8;">
              <li>The exam will only be accessible on the scheduled date and time</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Use a laptop or desktop computer for the best experience</li>
              <li>Do not refresh the page during the exam</li>
              <li>Results will be displayed immediately after submission</li>
            </ul>
          </div>

          <p style="font-size:13px;color:#64748b;line-height:1.7;margin-bottom:0;">
            For enquiries, contact us at <a href="mailto:${schoolEmail}" style="color:#0055ff;">${schoolEmail}</a> or call <strong>${schoolPhone}</strong>.
          </p>
        </div>
        <div style="padding:16px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const recipients = [params.email];
  if (params.guardianEmail && params.guardianEmail !== params.email) {
    recipients.push(params.guardianEmail);
  }

  return sendEmail(
    recipients,
    `Entrance Examination Invitation - ${schoolName} (${params.applicationNumber})`,
    html
  );
}

export async function sendEntranceExamResultEmail(params: {
  firstName: string;
  lastName: string;
  applicationNumber: string;
  classAppliedFor: string;
  email: string;
  guardianName?: string;
  guardianEmail?: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  percentage: number;
}) {
  const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;
  const schoolEmail = process.env.SCHOOL_EMAIL || "noreply@ffb.edu.ng";
  const schoolPhone = process.env.SCHOOL_PHONE || SCHOOL_CONFIG.phone;

  const fullName = `${params.firstName} ${params.lastName}`;
  const statusColor = params.passed ? "#059669" : "#dc2626";
  const statusBg = params.passed ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)";
  const statusBorder = params.passed ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)";
  const statusText = params.passed ? "Congratulations! You have passed." : "We regret to inform you that you did not meet the required score.";
  const statusEmoji = params.passed ? "🎉" : "📋";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;">
      <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0a2a6e,#0055ff);padding:36px 32px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">${schoolName}</h1>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Entrance Examination Results</p>
        </div>
        <div style="padding:32px;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="width:64px;height:64px;border-radius:50%;background:${statusBg};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;border:2px solid ${statusBorder};">${statusEmoji}</div>
            <h2 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">Examination Results</h2>
          </div>

          <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:20px;">
            Dear <strong>${fullName}</strong>,
          </p>
          <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:24px;">
            ${statusText}
          </p>

          <div style="background:${statusBg};border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid ${statusBorder};text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Your Score</p>
            <p style="margin:0;font-size:48px;font-weight:800;color:${statusColor};">${params.percentage}%</p>
            <p style="margin:8px 0 0;font-size:13px;color:#64748b;">${params.score} out of ${params.totalQuestions} questions</p>
          </div>

          <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
            <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#0f172a;">📊 Score Breakdown</h3>
            <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:8px 0;font-weight:600;">Application Number</td><td style="padding:8px 0;text-align:right;">${params.applicationNumber}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Class Applied For</td><td style="padding:8px 0;text-align:right;border-top:1px solid #e5e7eb;">${params.classAppliedFor}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Correct Answers</td><td style="padding:8px 0;text-align:right;border-top:1px solid #e5e7eb;color:#059669;font-weight:600;">${params.score}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Total Questions</td><td style="padding:8px 0;text-align:right;border-top:1px solid #e5e7eb;">${params.totalQuestions}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Percentage</td><td style="padding:8px 0;text-align:right;border-top:1px solid #e5e7eb;color:${statusColor};font-weight:700;">${params.percentage}%</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;border-top:1px solid #e5e7eb;">Result</td><td style="padding:8px 0;text-align:right;border-top:1px solid #e5e7eb;color:${statusColor};font-weight:700;">${params.passed ? "PASSED" : "NOT PASSED"}</td></tr>
            </table>
          </div>

          ${params.passed ? `
          <div style="background:rgba(5,150,105,0.08);border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid rgba(5,150,105,0.2);">
            <h4 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#059669;">✅ Next Steps</h4>
            <ul style="margin:0;padding-left:18px;font-size:12px;color:#059669;line-height:1.8;">
              <li>Your application will now move to the interview stage</li>
              <li>You will receive an interview invitation soon</li>
              <li>Please prepare your original documents for verification</li>
            </ul>
          </div>
          ` : `
          <div style="background:rgba(220,38,38,0.08);border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid rgba(220,38,38,0.2);">
            <h4 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#dc2626;">📋 What's Next</h4>
            <ul style="margin:0;padding-left:18px;font-size:12px;color:#dc2626;line-height:1.8;">
              <li>Your application will be reviewed by the admissions team</li>
              <li>You may be contacted for additional information</li>
              <li>We encourage you to apply again in the future</li>
            </ul>
          </div>
          `}

          <p style="font-size:13px;color:#64748b;line-height:1.7;margin-bottom:0;">
            For enquiries, contact us at <a href="mailto:${schoolEmail}" style="color:#0055ff;">${schoolEmail}</a> or call <strong>${schoolPhone}</strong>.
          </p>
        </div>
        <div style="padding:16px 32px;background:#f8fafc;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const recipients = [params.email];
  if (params.guardianEmail && params.guardianEmail !== params.email) {
    recipients.push(params.guardianEmail);
  }

  return sendEmail(
    recipients,
    `Entrance Examination ${params.passed ? "Results - Passed" : "Results"} - ${schoolName} (${params.applicationNumber})`,
    html
  );
}

