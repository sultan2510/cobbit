import { NextRequest, NextResponse } from "next/server";
import { sendRejectedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { members, reason } = await req.json(); // members: [{ email, name }, ...]
    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: "Missing members" }, { status: 400 });
    }

    const results = await Promise.allSettled(
      members.map((m: { email: string; name: string }) => sendRejectedEmail(m.email, m.name, reason))
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length) console.error("Some rejection emails failed:", failed);

    return NextResponse.json({ ok: true, sent: results.length - failed.length, failed: failed.length });
  } catch (err: any) {
    console.error("Failed to send rejection emails:", err.message);
    return NextResponse.json({ ok: true, emailFailed: true });
  }
}
