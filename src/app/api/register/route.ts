import { NextRequest, NextResponse } from "next/server";
import { sendRegistrationReceivedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    if (!email || !name) {
      return NextResponse.json({ error: "Missing email or name" }, { status: 400 });
    }
    await sendRegistrationReceivedEmail(email, name);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Don't fail the registration flow if the email fails to send —
    // just log it. The registration itself is already saved.
    console.error("Failed to send registration email:", err.message);
    return NextResponse.json({ ok: true, emailFailed: true });
  }
}
