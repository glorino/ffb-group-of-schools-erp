import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, name, role, password } = body;

    if (!to || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "welcome") {
      try {
        await sendWelcomeEmail(name, to, role || "Staff");
        return NextResponse.json({ success: true, message: "Email sent" });
      } catch (emailErr: any) {
        return NextResponse.json({ success: true, message: "Account created but email could not be sent: " + emailErr.message });
      }
    }

    return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
