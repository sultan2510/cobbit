import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateCertificate, makeCertificateNumber } from "@/lib/certificate";
import { sendCertificateEmail } from "@/lib/email";
import { getEventSettings, formatDateRange } from "@/lib/settings";
import type { Registration } from "@/lib/types";

export const runtime = "nodejs"; // needs Node APIs (Buffer, pdf-lib) — not Edge
export const maxDuration = 120; // allow extra time — this can process many registrations

export async function POST(req: NextRequest) {
  try {
    const { winningRegistrationId } = await req.json();
    if (!winningRegistrationId) {
      return NextResponse.json({ error: "winningRegistrationId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const eventSettings = await getEventSettings(supabase);
    const eventLabel = eventSettings.event_name;
    const eventDates = formatDateRange(eventSettings.hackathon_start, eventSettings.hackathon_end);

    // 1. Mark the winning submission
    const { data: winningReg, error: winRegError } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", winningRegistrationId)
      .single<Registration>();

    if (winRegError || !winningReg) {
      return NextResponse.json({ error: "Winning registration not found" }, { status: 404 });
    }

    const { error: winSubError } = await supabase
      .from("submissions")
      .update({ status: "winner" })
      .eq("registration_id", winningRegistrationId);
    if (winSubError) throw winSubError;

    // 2. Fetch every approved registration — everyone gets a participation certificate
    const { data: approvedRegs, error: regsError } = await supabase
      .from("registrations")
      .select("*")
      .eq("status", "approved")
      .returns<Registration[]>();
    if (regsError) throw regsError;

    const results: { email: string; ok: boolean; error?: string }[] = [];

    for (const reg of approvedRegs || []) {
      const isWinningTeam = reg.id === winningRegistrationId;

      for (let i = 0; i < reg.members.length; i++) {
        const member = reg.members[i];
        try {
          const attachments: { filename: string; content: string }[] = [];

          // Participation certificate — everyone gets this
          const partNumber = makeCertificateNumber(reg.id, i, "participation");
          const partBytes = await generateCertificate({
            recipientName: member.full_name,
            type: "participation",
            certificateNumber: partNumber,
            eventLabel,
            eventDates
          });
          const partPath = `${reg.id}/participation-${i}.pdf`;
          await supabase.storage.from("certificates").upload(partPath, Buffer.from(partBytes), {
            contentType: "application/pdf",
            upsert: true
          });
          await supabase.from("certificates").upsert(
            {
              registration_id: reg.id,
              member_index: i,
              recipient_name: member.full_name,
              recipient_email: member.email,
              type: "participation",
              certificate_number: partNumber,
              storage_path: partPath
            },
            { onConflict: "certificate_number" }
          );
          attachments.push({
            filename: "COBBIT-Certificate-of-Participation.pdf",
            content: Buffer.from(partBytes).toString("base64")
          });

          // Appreciation certificate — winning team only
          if (isWinningTeam) {
            const aprNumber = makeCertificateNumber(reg.id, i, "appreciation");
            const aprBytes = await generateCertificate({
              recipientName: member.full_name,
              type: "appreciation",
              certificateNumber: aprNumber,
              eventLabel,
              eventDates
            });
            const aprPath = `${reg.id}/appreciation-${i}.pdf`;
            await supabase.storage.from("certificates").upload(aprPath, Buffer.from(aprBytes), {
              contentType: "application/pdf",
              upsert: true
            });
            await supabase.from("certificates").upsert(
              {
                registration_id: reg.id,
                member_index: i,
                recipient_name: member.full_name,
                recipient_email: member.email,
                type: "appreciation",
                certificate_number: aprNumber,
                storage_path: aprPath
              },
              { onConflict: "certificate_number" }
            );
            attachments.push({
              filename: "COBBIT-Certificate-of-Appreciation.pdf",
              content: Buffer.from(aprBytes).toString("base64")
            });
          }

          await sendCertificateEmail({
            to: member.email,
            name: member.full_name,
            isWinner: isWinningTeam,
            attachments
          });

          results.push({ email: member.email, ok: true });
        } catch (err: any) {
          console.error(`Certificate failed for ${member.email}:`, err.message);
          results.push({ email: member.email, ok: false, error: err.message });
        }
      }
    }

    return NextResponse.json({ ok: true, issued: results.length, results });
  } catch (err: any) {
    console.error("announce-results failed:", err.message);
    return NextResponse.json({ error: err.message || "Failed to announce results" }, { status: 500 });
  }
}
