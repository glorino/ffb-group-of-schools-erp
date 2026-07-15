const RESEND_BASE_URL = "https://api.resend.com";

function getApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return apiKey;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@ffb.edu.ng";
const FROM_NAME = process.env.RESEND_FROM_NAME || "FFB Group of Schools";

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
          <h1>FFB Group of Schools</h1>
          <p>Welcome to our School ERP System</p>
        </div>
        <div class="content">
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been successfully created. We're excited to have you on board.</p>
          <p><span class="badge">${role}</span></p>
          <p>You can now log in to access the system using your registered email address. If you have any questions, please don't hesitate to reach out to our support team.</p>
          <p>Thank you for choosing FFB Group of Schools!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} FFB Group of Schools. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, "Welcome to FFB Group of Schools", html);
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
          <p>&copy; ${new Date().getFullYear()} FFB Group of Schools. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, `Payment Receipt - ${reference}`, html);
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
          <h1>FFB Group of Schools</h1>
          <p>Admission Offer</p>
        </div>
        <div class="content">
          <h2>Congratulations, ${name}!</h2>
          <p>We are pleased to inform you that you have been offered admission into FFB Group of Schools. Below are your admission details:</p>
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
          <p>&copy; ${new Date().getFullYear()} FFB Group of Schools. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, "Admission Letter - FFB Group of Schools", html);
}
