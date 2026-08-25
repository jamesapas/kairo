import { jsPDF } from "jspdf";

export interface CoverLetterPdfOptions {
  content: string;
  candidateName?: string;
  companyName?: string;
  jobTitle?: string;
  fileName?: string;
}

/**
 * Generates a clean, classic, executive Cover Letter PDF formatted in standard Arial/Helvetica.
 * Features 1-inch (25.4mm) margins, uniform 10pt typography matching body size, solid black text,
 * zero overflow, and consistent business-letter line and paragraph spacing.
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
    format: "letter", // 8.5in x 11in (215.9mm x 279.4mm)
  });

  const pageWidth = 215.9;
  const pageHeight = 279.4;
  const marginX = 25.4; // Standard 1-inch (25.4mm) left & right margins
  const marginTop = 25.4; // Standard 1-inch (25.4mm) top margin
  const marginBottom = 25.4; // Standard 1-inch (25.4mm) bottom margin
  const printableWidth = pageWidth - marginX * 2; // 165.1mm exact printable boundary

  // Uniform typography constants
  const FONT_FAMILY = "helvetica";
  const BODY_FONT_SIZE = 10; // pt
  const NAME_FONT_SIZE = 11.5; // pt (Bold)
  const LINE_HEIGHT_MM = 5.0; // mm per line
  const PARAGRAPH_GAP_MM = 4.0; // mm between paragraph blocks

  let cursorY = marginTop;

  // Helper to handle auto-paging cleanly
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  };

  // Helper to print a wrapped block of text safely within printableWidth
  const printWrappedBlock = (
    text: string,
    isBold: boolean = false,
    customFontSize: number = BODY_FONT_SIZE
  ) => {
    doc.setFont(FONT_FAMILY, isBold ? "bold" : "normal");
    doc.setFontSize(customFontSize);
    doc.setTextColor(0, 0, 0); // Solid black for formal print

    // Normalize text while maintaining word breaks
    const cleanText = text.replace(/[ \t]+/g, " ").trim();
    if (!cleanText) return;

    const wrappedLines = doc.splitTextToSize(cleanText, printableWidth);
    for (const line of wrappedLines) {
      checkPageBreak(LINE_HEIGHT_MM);
      doc.text(line, marginX, cursorY);
      cursorY += LINE_HEIGHT_MM;
    }
  };

  // Normalize raw content into paragraphs split by double line breaks
  const normalizedContent = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  const blocks = normalizedContent.split(/\n\s*\n+/);

  for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
    const rawBlock = blocks[bIdx].trim();
    if (!rawBlock) continue;

    // Check 1: Candidate Header (First block containing Name, Location, Links)
    if (bIdx === 0) {
      const headerLines = rawBlock.split("\n").map((l) => l.trim()).filter(Boolean);
      const firstLine = headerLines[0] || "";

      const isCandidateName =
        firstLine.length > 0 &&
        (firstLine === firstLine.toUpperCase() ||
          (candidateName && firstLine.toLowerCase() === candidateName.trim().toLowerCase()));

      if (isCandidateName) {
        // Line 1: Candidate Name (Bold 11.5pt)
        printWrappedBlock(firstLine, true, NAME_FONT_SIZE);

        // Subsequent lines: Location, Email, Links (Normal 10pt, same style & size as body)
        for (let i = 1; i < headerLines.length; i++) {
          printWrappedBlock(headerLines[i], false, BODY_FONT_SIZE);
        }

        cursorY += PARAGRAPH_GAP_MM;
        continue;
      }
    }

    // Check 2: Subject Line ("Re: ... Application")
    if (/^re:/i.test(rawBlock)) {
      printWrappedBlock(rawBlock, true, BODY_FONT_SIZE);
      cursorY += PARAGRAPH_GAP_MM;
      continue;
    }

    // Check 3: Salutation ("Dear Hiring Manager," / "Dear Hiring Team,")
    if (/^dear\s+/i.test(rawBlock)) {
      printWrappedBlock(rawBlock, false, BODY_FONT_SIZE);
      cursorY += PARAGRAPH_GAP_MM;
      continue;
    }

    // Check 4: Formal Sign-off ("Sincerely,\nJames Karl Apas")
    if (
      /^(sincerely|best regards|warm regards|regards|respectfully|thank you),?/i.test(
        rawBlock
      )
    ) {
      const signLines = rawBlock.split("\n").map((l) => l.trim()).filter(Boolean);
      if (signLines.length > 0) {
        // "Sincerely," (Normal 10pt)
        printWrappedBlock(signLines[0], false, BODY_FONT_SIZE);

        // Add classic signature gap
        cursorY += 2.0;

        // Candidate Name (Bold 10.5pt)
        for (let i = 1; i < signLines.length; i++) {
          printWrappedBlock(signLines[i], true, BODY_FONT_SIZE);
        }
      }
      cursorY += PARAGRAPH_GAP_MM;
      continue;
    }

    // Check 5: Multi-line Date & Recipient block (e.g. Date, Hiring Manager, Company Name, Address)
    const linesInBlock = rawBlock.split("\n").map((l) => l.trim()).filter(Boolean);
    const looksLikeDateOrRecipient =
      linesInBlock.length >= 2 &&
      linesInBlock.length <= 6 &&
      linesInBlock.some(
        (l) =>
          /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+/i.test(
            l
          ) ||
          /hiring|manager|director|recruiter|team|inc|llc|co|ltd|corp/i.test(l)
      );

    if (looksLikeDateOrRecipient) {
      for (const line of linesInBlock) {
        printWrappedBlock(line, false, BODY_FONT_SIZE);
      }
      cursorY += PARAGRAPH_GAP_MM;
      continue;
    }

    // Check 6: Standard Body Paragraph (Normal 10pt, smooth wrapping within printableWidth)
    printWrappedBlock(rawBlock, false, BODY_FONT_SIZE);
    cursorY += PARAGRAPH_GAP_MM;
  }

  // Generate safe filename and trigger download
  const sanitize = (s: string) =>
    s
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .trim();

  const safeCandidate = sanitize(candidateName || "Candidate");
  const safeCompany = sanitize(companyName || jobTitle || "Application");
  const defaultFileName = `${safeCandidate}_Cover_Letter_${safeCompany}.pdf`;

  const finalName = fileName || defaultFileName;
  doc.save(finalName);
}
