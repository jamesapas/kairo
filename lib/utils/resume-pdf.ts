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
  const marginX = 15.5; // ~0.59 in (15.5mm) left & right margins
  const marginTop = 15.5; // ~0.59 in top margin
  const marginBottom = 15.5; // ~0.59 in bottom margin
  const printableWidth = pageWidth - marginX * 2; // 185.9mm
  const centerX = pageWidth / 2;

  const FONT_FAMILY = "helvetica";
  const NAME_FONT_SIZE = 18; // 18pt
  const ROLE_FONT_SIZE = 12; // 12pt
  const CONTACT_FONT_SIZE = 10; // 10pt
  const SECTION_FONT_SIZE = 11; // 11pt
  const BODY_FONT_SIZE = 10.5; // 10.5pt
  const LINE_HEIGHT_MM = 4.8; // Compact line spacing
  const EXPERIENCE_GAP_MM = 2.0; // Inter-experience gap (2.0mm)
  const PROJECT_GAP_MM = 2.0; // Inter-project gap matching experience (2.0mm)

  let cursorY = marginTop;

  const checkPageBreak = (neededHeight: number = 0): boolean => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
      return true;
    }
    return false;
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

    // Line 3+: Contact Info & Links (Centered, 10pt, Clickable)
    if (headerLines.length > 2) {
      for (let h = 2; h < headerLines.length; h++) {
        const contactLine = headerLines[h];
        doc.setFont(FONT_FAMILY, "normal");
        doc.setFontSize(CONTACT_FONT_SIZE);
        doc.setTextColor(0, 0, 0);

        const rawItems = contactLine.split("|").map((s) => s.trim()).filter(Boolean);
        if (rawItems.length === 0) continue;

        const items = rawItems.map((text) => {
          let url: string | null = null;
          if (text.includes("@") && !text.includes("/")) {
            url = `https://mail.google.com/mail/u/0/?fs=1&to=${encodeURIComponent(text)}&tf=cm`;
          } else if (text.includes(".") || text.startsWith("http")) {
            url = text.startsWith("http") ? text : `https://${text}`;
          } else if (/^\+?[\d\s\-().]{7,}$/.test(text) && text.replace(/\D/g, "").length >= 7) {
            url = `tel:${text.replace(/[\s\-().]/g, "")}`;
          }
          return {
            text,
            url,
            width: doc.getTextWidth(text),
          };
        });

        const sep = " | ";
        const sepWidth = doc.getTextWidth(sep);

        // Group into rows if it exceeds printableWidth
        const rows: typeof items[] = [];
        let currentRow: typeof items = [];
        let currentWidth = 0;

        for (const item of items) {
          const needed = currentRow.length === 0 ? item.width : currentWidth + sepWidth + item.width;
          if (currentRow.length > 0 && needed > printableWidth) {
            rows.push(currentRow);
            currentRow = [item];
            currentWidth = item.width;
          } else {
            currentRow.push(item);
            currentWidth = needed;
          }
        }
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }

        for (let r = 0; r < rows.length; r++) {
          const rowItems = rows[r];
          const totalRowWidth =
            rowItems.reduce((acc, it) => acc + it.width, 0) + (rowItems.length - 1) * sepWidth;
          let startX = centerX - totalRowWidth / 2;

          for (let j = 0; j < rowItems.length; j++) {
            const it = rowItems[j];
            if (j > 0) {
              doc.text(sep, startX, cursorY);
              startX += sepWidth;
            }
            if (it.url) {
              doc.textWithLink(it.text, startX, cursorY, { url: it.url });
              doc.link(startX, cursorY - 3.0, it.width, 4.0, { url: it.url });
            } else {
              doc.text(it.text, startX, cursorY);
            }
            startX += it.width;
          }
          cursorY += 4.5;
        }
      }
    }

    cursorY += 5.0; // Space before first section
  }

  // 2. Process Sections & Body (e.g. PROFESSIONAL SUMMARY, TECHNICAL SKILLS, PROFESSIONAL EXPERIENCE, PROJECTS, EDUCATION)
  let isFirstSection = true;
  let lastItemWasSectionHeader = false;
  let currentSection = "";

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

    // Check for Section Header (e.g. "PROFESSIONAL SUMMARY", "TECHNICAL SKILLS", "PROFESSIONAL EXPERIENCE", "PROJECTS", "EDUCATION")
    const isSectionHeader =
      line.match(/^[A-Z\s/&-]{3,}$/) &&
      (line.includes("SUMMARY") ||
        line.includes("SKILL") ||
        line.includes("EXPERIENCE") ||
        line.includes("EDUCATION") ||
        line.includes("PROJECT"));

    if (isSectionHeader) {
      const sectionGap = !isFirstSection ? 3.0 : 0;
      isFirstSection = false;
      lastItemWasSectionHeader = true;

      if (line.includes("SUMMARY")) currentSection = "SUMMARY";
      else if (line.includes("SKILL")) currentSection = "SKILLS";
      else if (line.includes("EXPERIENCE")) currentSection = "EXPERIENCE";
      else if (line.includes("PROJECT")) currentSection = "PROJECTS";
      else if (line.includes("EDUCATION")) currentSection = "EDUCATION";
      else currentSection = "";

      // Section header needs: text + 2.0mm rule gap + 5.5mm body gap = 7.5mm
      // Plus at least 1 line of content (4.8mm) to avoid an orphan header
      if (cursorY + sectionGap + 7.5 + LINE_HEIGHT_MM > pageHeight - marginBottom) {
        doc.addPage();
        cursorY = marginTop;
      } else {
        cursorY += sectionGap;
      }

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

      // Draw wrapped bullet lines with hanging indent, paginating line-by-line
      for (let bIdx = 0; bIdx < wrappedBullet.length; bIdx++) {
        checkPageBreak(0);
        if (bIdx === 0) {
          doc.text("•", marginX + 0.5, cursorY);
        }
        doc.text(wrappedBullet[bIdx], marginX + bulletIndent, cursorY);
        cursorY += LINE_HEIGHT_MM;
      }

      i++;
      continue;
    }

    // Check for Project Entry (under PROJECTS section)
    if (currentSection === "PROJECTS") {
      const gap = !lastItemWasSectionHeader ? PROJECT_GAP_MM : 0;
      lastItemWasSectionHeader = false;

      // Check if project entry header fits (with at least 1 line of content)
      if (cursorY + gap + LINE_HEIGHT_MM > pageHeight - marginBottom) {
        doc.addPage();
        cursorY = marginTop;
      } else {
        cursorY += gap;
      }

      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(0, 0, 0);

      if (line.includes("|")) {
        const [titlePart, linkPart] = line.split("|").map((s) => s.trim());
        doc.setFont(FONT_FAMILY, "bold");
        doc.setFontSize(BODY_FONT_SIZE);
        doc.setTextColor(0, 0, 0);

        if (linkPart) {
          const titleWidth = doc.getTextWidth(titlePart);
          doc.text(titlePart, marginX, cursorY);

          const pipeStr = " | ";
          doc.setFont(FONT_FAMILY, "normal");
          const pipeWidth = doc.getTextWidth(pipeStr);
          doc.text(pipeStr, marginX + titleWidth, cursorY);

          // Clean display URL (hide https:// or http:// and trailing slash)
          const displayLink = linkPart.replace(/^https?:\/\//i, "").replace(/\/+$/g, "");
          const fullUrl = linkPart.startsWith("http") ? linkPart : `https://${linkPart}`;

          const linkX = marginX + titleWidth + pipeWidth;
          doc.textWithLink(displayLink, linkX, cursorY, { url: fullUrl });

          const linkWidth = doc.getTextWidth(displayLink);
          doc.link(linkX, cursorY - 3.2, linkWidth, 4.2, { url: fullUrl });
        } else {
          doc.text(titlePart, marginX, cursorY);
        }
        cursorY += LINE_HEIGHT_MM;
      } else {
        const wrapped = doc.splitTextToSize(line, printableWidth);
        for (const wLine of wrapped) {
          checkPageBreak(0);
          doc.text(wLine, marginX, cursorY);
          cursorY += LINE_HEIGHT_MM;
        }
      }

      i++;
      continue;
    }

    // Check for Experience / Education / Other Piped Header Line (e.g. Job Title | Date Range)
    const hasPipe = line.includes("|");
    if (hasPipe) {
      const looksLikeDateLine = /\b(present|\d{4})\b/i.test(line);
      const gapToUse = currentSection === "EXPERIENCE" ? EXPERIENCE_GAP_MM : 2.0;
      const gap = !lastItemWasSectionHeader && looksLikeDateLine ? gapToUse : 0;
      lastItemWasSectionHeader = false;

      // Check if entry header fits (with at least 1 line of content)
      if (cursorY + gap + LINE_HEIGHT_MM > pageHeight - marginBottom) {
        doc.addPage();
        cursorY = marginTop;
      } else {
        cursorY += gap;
      }

      const [titlePart, datePart] = line.split("|").map((s) => s.trim());

      // Title on the left (Bold)
      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(titlePart || "", marginX, cursorY);

      // Date Range on the right (Normal font)
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

    // Check for categorized skill line (e.g. "Languages: TypeScript, JavaScript, HTML, CSS")
    const colonMatch = !hasPipe && line.match(/^([^:]+:)\s*(.*)$/);
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
        checkPageBreak(0);
        doc.setFont(FONT_FAMILY, "bold");
        doc.text(categoryLabel, marginX, cursorY);
        doc.setFont(FONT_FAMILY, "normal");
        doc.text(skillsContent, marginX + labelWidth, cursorY);
        cursorY += LINE_HEIGHT_MM;
      } else {
        checkPageBreak(0);
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
            checkPageBreak(0);
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
      checkPageBreak(0);
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
