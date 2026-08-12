import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";

const COLORS = {
  charcoal: rgb(31 / 255, 31 / 255, 31 / 255),
  orange: rgb(255 / 255, 106 / 255, 26 / 255),
  peach: rgb(255 / 255, 178 / 255, 122 / 255),
  stone: rgb(168 / 255, 157 / 255, 146 / 255),
  cream: rgb(255 / 255, 246 / 255, 232 / 255)
};

export type CertificateType = "participation" | "appreciation";

function drawPebbles(page: PDFPage, x: number, y: number) {
  const pebbles: [number, number, number, number, ReturnType<typeof rgb>][] = [
    [0, 0, 22, 16, COLORS.stone],
    [30, 10, 16, 12, COLORS.charcoal],
    [54, -4, 12, 9, COLORS.orange],
    [72, 8, 9, 8, COLORS.stone]
  ];
  for (const [dx, dy, rx, ry, color] of pebbles) {
    page.drawEllipse({ x: x + dx, y: y + dy, xScale: rx, yScale: ry, color });
  }
}

function centerText(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color = COLORS.charcoal) {
  const width = font.widthOfTextAtSize(text, size);
  const pageWidth = page.getWidth();
  page.drawText(text, { x: (pageWidth - width) / 2, y, size, font, color });
}

/**
 * Generates a single landscape A4-ish certificate PDF as bytes.
 * Uses pdf-lib's built-in Helvetica fonts to avoid bundling custom font
 * files in the serverless function — swap in an embedded Baloo 2 TTF later
 * via @pdf-lib/fontkit for a closer brand match if desired.
 */
export async function generateCertificate({
  recipientName,
  type,
  certificateNumber,
  eventLabel = "COBBIT Hackathon #01",
  eventDates = "August 31 – September 6, 2026"
}: {
  recipientName: string;
  type: CertificateType;
  certificateNumber: string;
  eventLabel?: string;
  eventDates?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([792, 612]); // US Letter, landscape

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const { width, height } = page.getSize();

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.cream });

  // Outer charcoal border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: COLORS.charcoal,
    borderWidth: 2
  });

  // Top orange accent bar
  page.drawRectangle({ x: 24, y: height - 48, width: width - 48, height: 6, color: COLORS.orange });

  // Wordmark
  page.drawText("COBBIT", { x: 60, y: height - 96, size: 26, font: bold, color: COLORS.charcoal });

  // Title
  const title = type === "appreciation" ? "Certificate of Appreciation" : "Certificate of Participation";
  centerText(page, title, height - 190, bold, 30, COLORS.charcoal);

  // Sub line
  centerText(page, "This certifies that", height - 230, regular, 13, COLORS.charcoal);

  // Recipient name
  centerText(page, recipientName, height - 280, bold, 34, COLORS.orange);

  // Body copy
  const bodyLine =
    type === "appreciation"
      ? `is recognized for an outstanding winning project at ${eventLabel}, ${eventDates}, held remotely across Pakistan.`
      : `successfully participated in ${eventLabel}, ${eventDates}, held remotely across Pakistan.`;

  const maxWidth = width - 220;
  const words = bodyLine.split(" ");
  let line = "";
  let y = height - 320;
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (regular.widthOfTextAtSize(test, 13) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  for (const l of lines) {
    centerText(page, l, y, regular, 13, COLORS.charcoal);
    y -= 20;
  }

  // Pebble motif, bottom right
  drawPebbles(page, width - 170, 90);

  // Footer: certificate number + date (left), signature line (right)
  page.drawText(`Certificate No. ${certificateNumber}`, { x: 60, y: 70, size: 10, font: mono, color: COLORS.charcoal });
  page.drawText(`Issued ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, {
    x: 60,
    y: 56,
    size: 10,
    font: mono,
    color: COLORS.charcoal
  });

  page.drawLine({
    start: { x: width - 260, y: 76 },
    end: { x: width - 60, y: 76 },
    thickness: 1,
    color: COLORS.charcoal
  });
  page.drawText("COBBIT Team", { x: width - 200, y: 60, size: 11, font: bold, color: COLORS.charcoal });

  return doc.save();
}

export function makeCertificateNumber(registrationId: string, memberIndex: number, type: CertificateType) {
  const prefix = type === "appreciation" ? "COB-APR" : "COB-PRT";
  return `${prefix}-${registrationId.slice(0, 8).toUpperCase()}-${memberIndex}`;
}
