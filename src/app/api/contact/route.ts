import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { SCHOOL_CONFIG } from "@/lib/school-config";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const schoolEmail = process.env.SCHOOL_EMAIL || SCHOOL_CONFIG.email;
    const schoolName = process.env.SCHOOL_NAME || SCHOOL_CONFIG.name;

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
          .content p { color: #475569; line-height: 1.6; margin: 0 0 12px; }
          .info-box { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0; }
          .info-box p { margin: 4px 0; color: #0c4a6e; font-size: 14px; }
          .info-box strong { color: #1e3a8a; }
          .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 16px 0; }
          .message-box p { color: #1e293b; line-height: 1.7; font-size: 15px; margin: 0; }
          .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { color: #94a3b8; margin: 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${schoolName}</h1>
            <p>New Contact Form Submission</p>
          </div>
          <div class="content">
            <h2>New Message Received</h2>
            <div class="info-box">
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <p><strong>Message:</strong></p>
            <div class="message-box">
              <p>${message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, "<br>")}</p>
            </div>
            <p>You can reply directly to <strong>${email}</strong> to respond to this inquiry.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      schoolEmail,
      `[Contact Form] ${subject} - ${name}`,
      html
    );

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    console.error("Failed to send contact form:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
