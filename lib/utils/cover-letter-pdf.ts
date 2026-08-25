import { jsPDF } from "jspdf";

export interface CoverLetterPdfOptions {
  content: string;
  candidateName?: string;
  companyName?: string;
  jobTitle?: string;
  fileName?: string;
}

/**
 * Cleanly generates a formal, beautifully formatted Cover Letter PDF in standard Arial/Helvetica font.
 */
export function downloadCoverLetterPdf({
  content,
  candidateName,
  companyName,
  jobTitle,
  fileName,
}: CoverLetterPdfOptions): void {
  if (!content || !content.trim()) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4", // 210mm x 297mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 20; // 20mm left & right margins
  const marginTop = 22; // 22mm top margin
  const marginBottom = 20; // 20mm bottom margin
  const printableWidth = pageWidth - marginX * 2; // 170mm

  // Standard Arial/Helvetica font
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30); // Clean dark charcoal (#1e1e1e)

  let cursorY = marginTop;

  // Split content into lines and paragraphs
  const rawLines = content.split("\n");

  // Helper to add line with auto-paging
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  };

  // Check if content begins with a structured candidate header (Name, Location, Contact)
  let lineIdx = 0;

  // 1. Process candidate header if present at top
  const firstNonEmpty = rawLines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmpty !== -1) {
    const firstLine = rawLines[firstNonEmpty].trim();

    // Check if first line looks like Candidate Name (uppercase or matches candidateName)
    const isCandidateName =
      firstLine === firstLine.toUpperCase() ||
      (candidateName && firstLine.toLowerCase() === candidateName.toLowerCase());

    if (isCandidateName) {
      // Candidate Name (Bold, 13pt)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(17, 24, 39); // Zinc-900
      doc.text(firstLine, marginX, cursorY);
      cursorY += 5.5;

      lineIdx = firstNonEmpty + 1;

      // Check for Location & Contact lines immediately following name
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99); // Zinc-600

      while (lineIdx < rawLines.length) {
        const line = rawLines[lineIdx].trim();
        if (!line) {
          lineIdx++;
          break; // Empty line signals end of header
        }

        // If line contains Date or "Dear" or "Re:", break out of header
        if (
          /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+/i.test(
            line
          ) ||
          /^re:/i.test(line) ||
          /^dear\s+/i.test(line)
        ) {
          break;
        }

        const contactLines = doc.splitTextToSize(line, printableWidth);
        for (const cl of contactLines) {
          doc.text(cl, marginX, cursorY);
          cursorY += 4.2;
        }
        lineIdx++;
      }

      // Subtle modern divider line below header
      cursorY += 1.5;
      doc.setDrawColor(229, 231, 235); // Zinc-200
      doc.setLineWidth(0.3);
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
      cursorY += 6.5;
    }
  }

  // 2. Process remaining sections (Date, Recipient, Subject, Salutation, Body, Sign-off)
  // Re-group lines into logical paragraphs separated by empty lines
  const remainingText = rawLines.slice(lineIdx).join("\n").trim();
  const paragraphs = remainingText.split(/\n\s*\n+/);

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // Check if this block is a "Re: ..." subject line
    if (/^re:/i.test(trimmedPara)) {
      checkPageBreak(8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(17, 24, 39);

      const subLines = doc.splitTextToSize(trimmedPara, printableWidth);
      for (const sl of subLines) {
        doc.text(sl, marginX, cursorY);
        cursorY += 5;
      }
      cursorY += 2; // Small gap after Subject
      continue;
    }

    // Check if this block is Salutation (e.g. "Dear Hiring Manager,")
    if (/^dear\s+/i.test(trimmedPara)) {
      checkPageBreak(7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);

      doc.text(trimmedPara, marginX, cursorY);
      cursorY += 6.5;
      continue;
    }

    // Check if this block is Sign-off (e.g. "Sincerely,\nJames Karl Apas")
    if (/^(sincerely|best regards|regards|warm regards|respectfully),?/i.test(trimmedPara)) {
      checkPageBreak(16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);

      const signLines = trimmedPara.split("\n");
      for (let i = 0; i < signLines.length; i++) {
        const sl = signLines[i].trim();
        if (i === signLines.length - 1 && sl) {
          // Candidate Name at end of sign-off: Bold
          doc.setFont("helvetica", "bold");
          doc.setTextColor(17, 24, 39);
        }
        if (sl) {
          doc.text(sl, marginX, cursorY);
          cursorY += 5;
        }
      }
      cursorY += 4;
      continue;
    }

    // Regular paragraph or Recipient / Date block
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);

    // If paragraph contains individual lines like Date & Recipient block
    const subLines = trimmedPara.split("\n");
    if (subLines.length > 1 && subLines.length <= 4 && subLines.some((l) => /hiring/i.test(l) || /inc|llc|co|ltd|corp/i.test(l))) {
      for (const sl of subLines) {
        const text = sl.trim();
        if (text) {
          checkPageBreak(5);
          doc.text(text, marginX, cursorY);
          cursorY += 4.8;
        }
      }
      cursorY += 3;
      continue;
    }

    // Standard body paragraph
    const wrappedLines = doc.splitTextToSize(trimmedPara.replace(/\n+/g, " "), printableWidth);
    const neededHeight = wrappedLines.length * 4.8 + 4;
    checkPageBreak(neededHeight);

    for (const wl of wrappedLines) {
      doc.text(wl, marginX, cursorY);
      cursorY += 4.8;
    }
    cursorY += 3.8; // Paragraph margin
  }

  // Generate safe filename
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
  const defaultFileName = `${sanitize(candidateName || "Candidate")}_Cover_Letter_${sanitize(
    companyName || jobTitle || "Application"
  )}.pdf`;

  const finalName = fileName || defaultFileName;
  doc.save(finalName);
}
