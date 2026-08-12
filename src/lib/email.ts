import { Resend } from "resend";
import { createAdminClient } from "./supabase/admin";
import { getEventSettings, formatDate } from "./settings";

// Constructed lazily (only when actually sending an email) instead of at
// module load. The Resend SDK throws if RESEND_API_KEY is missing, and
// Next.js imports every route module during the build's "collect page
// data" step — a top-level `new Resend(...)` would crash the build on
// any deploy where the env var isn't set yet.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || "COBBIT <hello@cobbit.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://cobbit.dev";

// Pulls current event name/dates/community links from Supabase so emails
// never go stale — same source of truth the admin edits in the Settings tab.
async function loadEventCopy() {
  const settings = await getEventSettings(createAdminClient());
  return {
    eventName: settings.event_name,
    hackathonStart: formatDate(settings.hackathon_start),
    submissionDeadline: formatDate(settings.submission_deadline),
    discordLink: settings.discord_link,
    whatsappLink: settings.whatsapp_link
  };
}

// Renders a "Join the community" block only for links the admin has actually
// filled in — an empty Settings field means no button, not a dead link.
function communityLinksHtml(discordLink: string, whatsappLink: string) {
  const links: string[] = [];
  if (whatsappLink?.trim()) {
    links.push(`<a href="${whatsappLink}" style="color:#FF6A1A; font-weight:600;">Join WhatsApp community →</a>`);
  }
  if (discordLink?.trim()) {
    links.push(`<a href="${discordLink}" style="color:#FF6A1A; font-weight:600;">Join Discord →</a>`);
  }
  if (links.length === 0) return "";
  return `<p>${links.join("<br/>")}</p>`;
}

function wrapper(bodyHtml: string, eventName: string) {
  return `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; background:#FFF6E8; padding:32px;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #eee;">
      <div style="background:#1F1F1F; padding:24px 32px;">
        <span style="color:#FF6A1A; font-size:22px; font-weight:800; letter-spacing:0.5px;">COBBIT</span>
      </div>
      <div style="padding:32px; color:#1F1F1F; line-height:1.6;">
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px; background:#FFF6E8; color:#4A4A4A; font-size:12px;">
        ${eventName} · ${SITE}
      </div>
    </div>
  </div>`;
}

export async function sendRegistrationReceivedEmail(to: string, name: string) {
  const { eventName } = await loadEventCopy();
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `We've received your ${eventName} registration`,
    html: wrapper(
      `
      <h2 style="margin-top:0;">Hey ${name},</h2>
      <p>Thanks for registering for <strong>${eventName}</strong>. Your registration is now <strong>pending review</strong> while we confirm your payment.</p>
      <p>You'll get another email as soon as it's approved — usually within 24–48 hours. You can also check your status anytime on your dashboard.</p>
      <p><a href="${SITE}/dashboard" style="color:#FF6A1A; font-weight:600;">View your dashboard →</a></p>
    `,
      eventName
    )
  });
}

export async function sendApprovedEmail(to: string, name: string) {
  const { eventName, hackathonStart, submissionDeadline, discordLink, whatsappLink } = await loadEventCopy();
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `You're in! ${eventName} registration approved`,
    html: wrapper(
      `
      <h2 style="margin-top:0;">You're confirmed, ${name} 🎉</h2>
      <p>Your registration for <strong>${eventName}</strong> has been approved. Welcome to the builder list.</p>
      <p>Next: join the community, start building on <strong>${hackathonStart}</strong>, and submit your project before the deadline on <strong>${submissionDeadline}</strong>.</p>
      ${communityLinksHtml(discordLink, whatsappLink)}
      <p><a href="${SITE}/dashboard" style="color:#FF6A1A; font-weight:600;">Go to your dashboard →</a></p>
    `,
      eventName
    )
  });
}

export async function sendRejectedEmail(to: string, name: string, reason: string) {
  const { eventName } = await loadEventCopy();
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Update on your ${eventName} registration`,
    html: wrapper(
      `
      <h2 style="margin-top:0;">Hi ${name},</h2>
      <p>We weren't able to approve your registration for <strong>${eventName}</strong> right now.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you think this is a mistake or want to fix and resubmit your details, reply to this email and we'll help you sort it out.</p>
    `,
      eventName
    )
  });
}

export async function sendCertificateEmail({
  to,
  name,
  isWinner,
  attachments
}: {
  to: string;
  name: string;
  isWinner: boolean;
  attachments: { filename: string; content: string }[]; // content = base64
}) {
  const { eventName } = await loadEventCopy();
  await getResend().emails.send({
    from: FROM,
    to,
    subject: isWinner
      ? "🏆 Your COBBIT certificates — Participation & Appreciation"
      : "Your COBBIT Hackathon Certificate of Participation",
    html: wrapper(
      `
      <h2 style="margin-top:0;">Hey ${name},</h2>
      ${
        isWinner
          ? `<p>Congratulations again on winning <strong>${eventName}</strong>! Attached are your Certificate of Participation and Certificate of Appreciation. The COBBIT team will be in touch shortly about your cash prize.</p>`
          : `<p>Thanks for building with us at <strong>${eventName}</strong>. Your Certificate of Participation is attached.</p>`
      }
      <p>We'd love to see you at the next one.</p>
    `,
      eventName
    ),
    attachments
  });
}