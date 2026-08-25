import { jsPDF } from "jspdf";

export interface ResumePdfOptions {
  content: string;
  candidateName?: string;
  jobTitle?: string;
  fileName?: string;
}

/**
 * Generates an ATS-friendly, single-column Resume PDF in Arial/Helvetica.
 * Features centered header (Name, Target Role, Contact Links), uppercase section headings
 * with horizontal divider rules, and clean typography.
 */
export function downloadResumePdf({
  content,
  candidateName,
  jobTitle,
  fileName,
}: ResumePdfOptions): void {
  if (!content || !content.trim()) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter", // 8.5in x 11in (215.9mm x 279.4mm)
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 20; // 20mm left & right margins for ATS resume layout
  const marginTop = 20;
  const marginBottom = 20;
  const printableWidth = pageWidth - marginX * 2; // 175.9mm
  const centerX = pageWidth / 2;

  const FONT_FAMILY = "helvetica";
  const NAME_FONT_SIZE = 14; // ~18px
  const ROLE_FONT_SIZE = 10; // ~12px
  const CONTACT_FONT_SIZE = 8.5; // ~10px
  const SECTION_FONT_SIZE = 9.5; // ~11px
  const BODY_FONT_SIZE = 9.0; // ~10.5px
  const LINE_HEIGHT_MM = 4.4;

  let cursorY = marginTop;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  };

  const normalizedContent = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  const lines = normalizedContent.split("\n");
  let i = 0;

  // 1. Process Header lines (Candidate Name, Role Title, Contact Line)
  const headerLines: string[] = [];
  while (i < lines.length && !lines[i].trim().match(/^PROFESSIONAL SUMMARY/i)) {
    const line = lines[i].trim();
    if (line) {
      headerLines.push(line);
    }
    i++;
  }

  if (headerLines.length > 0) {
    // Line 1: Name (Centered, Bold, 14pt / 18px)
    const nameLine = headerLines[0];
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(NAME_FONT_SIZE);
    doc.setTextColor(0, 0, 0);
    doc.text(nameLine, centerX, cursorY, { align: "center" });
    cursorY += 6.0;

    // Line 2: Role Title (Centered, Normal, 10pt / 12px - same style and black color as body)
    if (headerLines.length > 1) {
      const roleLine = headerLines[1];
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(ROLE_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(roleLine, centerX, cursorY, { align: "center" });
      cursorY += 5.0;
    }

    // Line 3+: Contact Info (Centered, 8.5pt / 10px - same style and black color as body)
    if (headerLines.length > 2) {
      for (let h = 2; h < headerLines.length; h++) {
        const contactLine = headerLines[h];
        doc.setFont(FONT_FAMILY, "normal");
        doc.setFontSize(CONTACT_FONT_SIZE);
        doc.setTextColor(0, 0, 0);
        doc.text(contactLine, centerX, cursorY, { align: "center" });
        cursorY += 4.5;
      }
    }

    cursorY += 6.0; // Breathable space before first section
  }

  // 2. Process Sections & Body (e.g. PROFESSIONAL SUMMARY)
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    // Skip markdown dashes or horizontal lines
    if (line.match(/^[-=_]{3,}$/)) {
      i++;
      continue;
    }

    // Check for Section Header (e.g. "PROFESSIONAL SUMMARY")
    if (line.match(/^[A-Z\s]{4,}$/i) && line.toUpperCase().includes("SUMMARY")) {
      checkPageBreak(14);
      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(SECTION_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(line.toUpperCase(), marginX, cursorY);
      cursorY += 2.0;

      // Draw solid black horizontal line across printable boundary
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.35);
      doc.line(marginX, cursorY, marginX + printableWidth, cursorY);
      cursorY += 5.5; // Small space after horizontal line for the body text
      i++;
      continue;
    }

    // Body text paragraph (10.5px / 9pt)
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(BODY_FONT_SIZE);
    doc.setTextColor(0, 0, 0);

    const wrappedLines = doc.splitTextToSize(line, printableWidth);
    for (const wLine of wrappedLines) {
      checkPageBreak(LINE_HEIGHT_MM);
      doc.text(wLine, marginX, cursorY);
      cursorY += LINE_HEIGHT_MM;
    }
    cursorY += 2.0;
    i++;
  }

  // Generate safe filename and trigger download
  const sanitize = (s: string) =>
    s
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .trim();

  const safeCandidate = sanitize(candidateName || "Candidate");
  const safeJob = sanitize(jobTitle || "Resume");
  const defaultFileName = `${safeCandidate}_Resume_${safeJob}.pdf`;

  const finalName = fileName || defaultFileName;
  doc.save(finalName);
}
