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
  const marginX = 15.24; // 0.6 in (1.524 cm) left & right margins
  const marginTop = 15.24; // 0.6 in top margin
  const marginBottom = 15.24; // 0.6 in bottom margin
  const printableWidth = pageWidth - marginX * 2; // 185.42mm
  const centerX = pageWidth / 2;

  const FONT_FAMILY = "helvetica";
  const NAME_FONT_SIZE = 18; // 18pt
  const ROLE_FONT_SIZE = 12; // 12pt
  const CONTACT_FONT_SIZE = 10; // 10pt
  const SECTION_FONT_SIZE = 11; // 11pt
  const BODY_FONT_SIZE = 10.5; // 10.5pt
  const LINE_HEIGHT_MM = 5.0; // Very small line spacing

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
    // Line 1: Name (Centered, Bold, 18pt)
    const nameLine = headerLines[0];
    doc.setFont(FONT_FAMILY, "bold");
    doc.setFontSize(NAME_FONT_SIZE);
    doc.setTextColor(0, 0, 0);
    doc.text(nameLine, centerX, cursorY, { align: "center" });
    cursorY += 6.5;

    // Line 2: Role Title (Centered, Normal, 12pt)
    if (headerLines.length > 1) {
      const roleLine = headerLines[1];
      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(ROLE_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(roleLine, centerX, cursorY, { align: "center" });
      cursorY += 5.0;
    }

    // Line 3+: Contact Info (Centered, 10pt)
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

    cursorY += 5.0; // Space before first section
  }

  // 2. Process Sections & Body (e.g. PROFESSIONAL SUMMARY, TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE, EDUCATION)
  let isFirstSection = true;
  let lastItemWasSectionHeader = false;
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

    // Check for Section Header (e.g. "PROFESSIONAL SUMMARY", "TECHNICAL SKILLS", "PROFESSIONAL EXPERIENCE", "EDUCATION")
    const isSectionHeader =
      line.match(/^[A-Z\s/&-]{3,}$/) &&
      (line.includes("SUMMARY") ||
        line.includes("SKILL") ||
        line.includes("EXPERIENCE") ||
        line.includes("EDUCATION") ||
        line.includes("PROJECT"));

    if (isSectionHeader) {
      if (!isFirstSection) {
        cursorY += 3.0; // Compact space between sections
      }
      isFirstSection = false;
      lastItemWasSectionHeader = true;

      checkPageBreak(14);
      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(SECTION_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(line.toUpperCase(), marginX, cursorY);
      cursorY += 2.0;

      // Draw thin solid black horizontal line across printable boundary
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.20);
      doc.line(marginX, cursorY, marginX + printableWidth, cursorY);
      cursorY += 5.5; // Spacing after horizontal line for the body text
      i++;
      continue;
    }

    // Check for bullet point line (e.g. "• Developed full-stack web applications...")
    if (line.startsWith("•") || line.startsWith("- ")) {
      lastItemWasSectionHeader = false;
      const bulletText = line.replace(/^[•-]\s*/, "");
      const bulletIndent = 4.0; // mm

      doc.setFont(FONT_FAMILY, "normal");
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(0, 0, 0);

      const wrappedBullet = doc.splitTextToSize(bulletText, printableWidth - bulletIndent);
      checkPageBreak(LINE_HEIGHT_MM * wrappedBullet.length);

      // Draw bullet symbol
      doc.text("•", marginX + 0.5, cursorY);

      // Draw wrapped bullet lines with hanging indent
      for (let bIdx = 0; bIdx < wrappedBullet.length; bIdx++) {
        if (bIdx > 0) checkPageBreak(LINE_HEIGHT_MM);
        doc.text(wrappedBullet[bIdx], marginX + bulletIndent, cursorY);
        cursorY += LINE_HEIGHT_MM;
      }

      i++;
      continue;
    }

    // Check for Job Title / Course | Date Range line (e.g. "Junior Web Developer | July 2025 – July 2026")
    const hasPipe = line.includes("|");
    const looksLikeDateLine = /\b(present|\d{4})\b/i.test(line);

    if (hasPipe && looksLikeDateLine && !line.includes(":")) {
      if (!lastItemWasSectionHeader) {
        cursorY += 2.0; // Inter-item gap between previous entry and this new entry
      }
      lastItemWasSectionHeader = false;

      const [titlePart, datePart] = line.split("|").map((s) => s.trim());
      checkPageBreak(LINE_HEIGHT_MM + 2.0);

      // Job Title / Course Title on the left (Bold)
      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(titlePart || "", marginX, cursorY);

      // Date Range on the right (Normal font - NOT bold)
      if (datePart) {
        doc.setFont(FONT_FAMILY, "normal");
        doc.setFontSize(BODY_FONT_SIZE);
        doc.setTextColor(0, 0, 0);
        doc.text(datePart, marginX + printableWidth, cursorY, { align: "right" });
      }

      cursorY += LINE_HEIGHT_MM;
      i++;
      continue;
    }

    // Check for other piped header line (e.g. Job Title | Company Name)
    if (hasPipe && !looksLikeDateLine && !line.includes(":")) {
      checkPageBreak(LINE_HEIGHT_MM + 2.0);
      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(0, 0, 0);

      const wrapped = doc.splitTextToSize(line, printableWidth);
      for (const wLine of wrapped) {
        checkPageBreak(LINE_HEIGHT_MM);
        doc.text(wLine, marginX, cursorY);
        cursorY += LINE_HEIGHT_MM;
      }
      i++;
      continue;
    }

    // Check for categorized line (e.g. "Languages: TypeScript, JavaScript, HTML, CSS")
    const colonMatch = line.match(/^([^:]+:)\s*(.*)$/);
    if (colonMatch) {
      const categoryLabel = colonMatch[1] + " ";
      const skillsContent = colonMatch[2];

      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      const labelWidth = doc.getTextWidth(categoryLabel);

      doc.setFont(FONT_FAMILY, "normal");
      const contentWidth = doc.getTextWidth(skillsContent);

      if (labelWidth + contentWidth <= printableWidth) {
        checkPageBreak(LINE_HEIGHT_MM);
        doc.setFont(FONT_FAMILY, "bold");
        doc.text(categoryLabel, marginX, cursorY);
        doc.setFont(FONT_FAMILY, "normal");
        doc.text(skillsContent, marginX + labelWidth, cursorY);
        cursorY += LINE_HEIGHT_MM;
      } else {
        checkPageBreak(LINE_HEIGHT_MM);
        doc.setFont(FONT_FAMILY, "bold");
        doc.text(categoryLabel, marginX, cursorY);
        doc.setFont(FONT_FAMILY, "normal");

        const words = skillsContent.split(" ");
        let firstLine = "";
        let w = 0;
        while (w < words.length) {
          const test = firstLine ? `${firstLine} ${words[w]}` : words[w];
          if (doc.getTextWidth(test) > printableWidth - labelWidth) break;
          firstLine = test;
          w++;
        }
        doc.text(firstLine, marginX + labelWidth, cursorY);
        cursorY += LINE_HEIGHT_MM;

        const remaining = words.slice(w).join(" ");
        if (remaining) {
          const restLines = doc.splitTextToSize(remaining, printableWidth);
          for (let rIdx = 0; rIdx < restLines.length; rIdx++) {
            checkPageBreak(LINE_HEIGHT_MM);
            doc.text(restLines[rIdx], marginX, cursorY);
            cursorY += LINE_HEIGHT_MM;
          }
        }
      }
      i++;
      continue;
    }

    // Standard body text paragraph (10.5px / 9pt)
    lastItemWasSectionHeader = false;
    doc.setFont(FONT_FAMILY, "normal");
    doc.setFontSize(BODY_FONT_SIZE);
    doc.setTextColor(0, 0, 0);

    const wrappedLines = doc.splitTextToSize(line, printableWidth);
    for (const wLine of wrappedLines) {
      checkPageBreak(LINE_HEIGHT_MM);
      doc.text(wLine, marginX, cursorY);
      cursorY += LINE_HEIGHT_MM;
    }
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
