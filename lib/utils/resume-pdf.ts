import { jsPDF } from "jspdf";

export type ResumePhotoSize = "sm" | "md" | "lg" | number;

export const RESUME_PHOTO_SIZES_MM: Record<"sm" | "md" | "lg", number> = {
  sm: 22.0, // Small (~22mm / ~0.87in)
  md: 28.0, // Medium (~28mm / ~1.10in)
  lg: 34.0, // Large (~34mm / ~1.34in)
};

export interface ResumePdfOptions {
  content: string;
  candidateName?: string;
  jobTitle?: string;
  fileName?: string;
  includePhoto?: boolean;
  photoUrl?: string | null;
  photoSize?: ResumePhotoSize;
}

/**
 * Prepares a square cropped image as a base64 JPEG data URL.
 * Handles both data URLs and remote URLs with CORS fallback.
 */
async function prepareSquarePhoto(url: string, sizePx = 360): Promise<string | null> {
  if (typeof window === "undefined" || !url) return null;

  return new Promise((resolve) => {
    const processImg = (imgEl: HTMLImageElement) => {
      try {
        const naturalW = imgEl.naturalWidth || imgEl.width;
        const naturalH = imgEl.naturalHeight || imgEl.height;
        if (!naturalW || !naturalH) return resolve(null);

        const minDim = Math.min(naturalW, naturalH);
        const canvas = document.createElement("canvas");
        canvas.width = sizePx;
        canvas.height = sizePx;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);

        // Center square crop
        const sx = (naturalW - minDim) / 2;
        const sy = (naturalH - minDim) / 2;
        ctx.drawImage(imgEl, sx, sy, minDim, minDim, 0, 0, sizePx, sizePx);

        resolve(canvas.toDataURL("image/jpeg", 0.95));
      } catch (err) {
        if (url.startsWith("data:")) {
          resolve(url);
        } else {
          console.warn("Could not extract canvas data for photo:", err);
          resolve(null);
        }
      }
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => processImg(img);
    img.onerror = async () => {
      // If direct image loading failed due to CORS, attempt fetch as blob
      try {
        const res = await fetch(url, { mode: "cors" });
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const fallbackImg = new Image();
          fallbackImg.onload = () => processImg(fallbackImg);
          fallbackImg.onerror = () => resolve(null);
          fallbackImg.src = reader.result as string;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      } catch {
        resolve(null);
      }
    };
    img.src = url;
  });
}

/**
 * Generates an ATS-friendly, single-column Resume PDF in Arial/Helvetica.
 * Features centered header (Photo, Name, Target Role, Contact Links), uppercase section headings
 * with horizontal divider rules, and clean typography.
 */
export async function downloadResumePdf({
  content,
  candidateName,
  jobTitle,
  fileName,
  includePhoto = false,
  photoUrl,
  photoSize = "md",
}: ResumePdfOptions): Promise<void> {
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
  const LINE_HEIGHT_MM = 5.0; // Line spacing (5.0mm)
  const SECTION_GAP_MM = 4.5; // Inter-section gap (4.5mm)
  const EXPERIENCE_GAP_MM = 3.0; // Inter-experience gap (3.0mm)
  const PROJECT_GAP_MM = 3.0; // Inter-project gap matching experience (3.0mm)
  const EDUCATION_GAP_MM = 3.0; // Inter-education gap (3.0mm)
  const BULLET_GAP_MM = 0.8; // Subtle spacing between consecutive bullet points (0.8mm)

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
    let squarePhotoData: string | null = null;
    if (includePhoto && photoUrl) {
      try {
        squarePhotoData = await prepareSquarePhoto(photoUrl, 360);
      } catch (photoErr) {
        console.warn("Failed to prepare photo for resume PDF:", photoErr);
      }
    }

    const hasPhoto = Boolean(squarePhotoData);

    if (hasPhoto) {
      // 1A. Left-Aligned Layout: Square Photo on the left, Name/Title/Contacts on the right
      const PHOTO_SIZE =
        typeof photoSize === "number"
          ? photoSize
          : RESUME_PHOTO_SIZES_MM[photoSize] || RESUME_PHOTO_SIZES_MM.md;
      const PHOTO_GAP = 5.0; // 5mm gap between photo and text
      const photoX = marginX;
      const photoY = cursorY;
      const textStartX = marginX + PHOTO_SIZE + PHOTO_GAP;
      const textPrintableWidth = printableWidth - (PHOTO_SIZE + PHOTO_GAP);

      // Draw square photo
      doc.addImage(squarePhotoData!, "JPEG", photoX, photoY, PHOTO_SIZE, PHOTO_SIZE, undefined, "FAST");
      // Subtle crisp square border around photo
      doc.setDrawColor(215, 215, 220);
      doc.setLineWidth(0.25);
      doc.rect(photoX, photoY, PHOTO_SIZE, PHOTO_SIZE, "S");

      let textCursorY = photoY + 5.2;

      // Line 1: Name (Left-aligned, Bold, 18pt)
      const nameLine = headerLines[0];
      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(NAME_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(nameLine, textStartX, textCursorY, { align: "left" });
      textCursorY += 6.5;

      // Line 2: Role Title (Left-aligned, Normal, 12pt)
      if (headerLines.length > 1) {
        const roleLine = headerLines[1];
        doc.setFont(FONT_FAMILY, "normal");
        doc.setFontSize(ROLE_FONT_SIZE);
        doc.setTextColor(0, 0, 0);
        doc.text(roleLine, textStartX, textCursorY, { align: "left" });
        textCursorY += 5.2;
      }

      // Line 3+: Contact Info & Links (Left-aligned, 10pt, Clickable)
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

          // Group into rows if it exceeds textPrintableWidth
          const rows: typeof items[] = [];
          let currentRow: typeof items = [];
          let currentWidth = 0;

          for (const item of items) {
            const needed = currentRow.length === 0 ? item.width : currentWidth + sepWidth + item.width;
            if (currentRow.length > 0 && needed > textPrintableWidth) {
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
            let startX = textStartX;

            for (let j = 0; j < rowItems.length; j++) {
              const it = rowItems[j];
              if (j > 0) {
                doc.text(sep, startX, textCursorY);
                startX += sepWidth;
              }
              if (it.url) {
                doc.textWithLink(it.text, startX, textCursorY, { url: it.url });
                doc.link(startX, textCursorY - 3.0, it.width, 4.0, { url: it.url });
              } else {
                doc.text(it.text, startX, textCursorY);
              }
              startX += it.width;
            }
            textCursorY += 4.5;
          }
        }
      }

      // Extra top space above the first section (e.g. PROFESSIONAL SUMMARY) when photo is included
      const TOP_SPACE_ABOVE_SUMMARY = 11.0; // mm gap before summary divider
      cursorY = Math.max(photoY + PHOTO_SIZE, textCursorY) + TOP_SPACE_ABOVE_SUMMARY;
    } else {
      // 1B. Centered Layout (Default ATS when no photo)
      // Line 1: Name (Centered, Bold, 18pt)
      const nameLine = headerLines[0];
      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(NAME_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(nameLine, centerX, cursorY, { align: "center" });
      cursorY += 7.2;

      // Line 2: Role Title (Centered, Normal, 12pt)
      if (headerLines.length > 1) {
        const roleLine = headerLines[1];
        doc.setFont(FONT_FAMILY, "normal");
        doc.setFontSize(ROLE_FONT_SIZE);
        doc.setTextColor(0, 0, 0);
        doc.text(roleLine, centerX, cursorY, { align: "center" });
        cursorY += 5.4;
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
            cursorY += 4.8;
          }
        }
      }

      cursorY += 5.5; // Space before first section
    }
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

    // Check for Section Header (e.g. "PROFESSIONAL SUMMARY", "TECHNICAL SKILLS", "PROFESSIONAL EXPERIENCE", "KEY PROJECTS", "CAPSTONE PROJECT", "SIDE PROJECTS", "EDUCATION")
    const isSectionHeader =
      line.match(/^[A-Z\s/&-]{3,}$/) &&
      (line.includes("SUMMARY") ||
        line.includes("SKILL") ||
        line.includes("EXPERIENCE") ||
        line.includes("EDUCATION") ||
        line.includes("PROJECT") ||
        line.includes("CAPSTONE"));

    if (isSectionHeader) {
      const sectionGap = !isFirstSection ? SECTION_GAP_MM : 0;
      isFirstSection = false;
      lastItemWasSectionHeader = true;

      if (line.includes("SUMMARY")) currentSection = "SUMMARY";
      else if (line.includes("SKILL")) currentSection = "SKILLS";
      else if (line.includes("EXPERIENCE")) currentSection = "EXPERIENCE";
      else if (line.includes("PROJECT") || line.includes("CAPSTONE")) currentSection = "PROJECTS";
      else if (line.includes("EDUCATION")) currentSection = "EDUCATION";
      else currentSection = "";

      // Section header needs: text + 2.2mm rule gap + 5.8mm body gap = 8.0mm
      // Plus at least 1 line of content to avoid an orphan header
      if (cursorY + sectionGap + 8.0 + LINE_HEIGHT_MM > pageHeight - marginBottom) {
        doc.addPage();
        cursorY = marginTop;
      } else {
        cursorY += sectionGap;
      }

      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(SECTION_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      doc.text(line.toUpperCase(), marginX, cursorY);
      cursorY += 2.2;

      // Draw thin solid black horizontal line across printable boundary
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.20);
      doc.line(marginX, cursorY, marginX + printableWidth, cursorY);
      cursorY += 5.8; // Spacing after horizontal line for the body text
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

      // Add subtle spacing between bullet points if followed by another bullet
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      if (nextLine.startsWith("•") || nextLine.startsWith("- ")) {
        cursorY += BULLET_GAP_MM;
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
      const gapToUse =
        currentSection === "EXPERIENCE"
          ? EXPERIENCE_GAP_MM
          : currentSection === "PROJECTS"
          ? PROJECT_GAP_MM
          : EDUCATION_GAP_MM;
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
      if (!skillsContent.trim()) {
        i++;
        continue;
      }

      doc.setFont(FONT_FAMILY, "bold");
      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      const labelWidth = doc.getTextWidth(categoryLabel.trimEnd()) + doc.getTextWidth(" ") * 1.5;

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
    const isEduTitle =
      currentSection === "EDUCATION" && (lastItemWasSectionHeader || !lines[i - 1]?.trim());
    lastItemWasSectionHeader = false;
    doc.setFont(FONT_FAMILY, isEduTitle ? "bold" : "normal");
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
  const toTitleCase = (str: string) => {
    if (str === str.toUpperCase() && str !== str.toLowerCase()) {
      return str
        .toLowerCase()
        .replace(/\b([a-z])/g, (_, c) => c.toUpperCase());
    }
    return str;
  };

  const cleanRoleTitle = (rawTitle: string) =>
    rawTitle
      .replace(/\s*[\(\[].*?[\)\]]/g, "")
      .replace(/\s*-\s*(remote|full-time|part-time|contract|hybrid).*$/i, "")
      .replace(/^(junior|jr\.?|senior|sr\.?|mid-level|mid|entry-level|lead|principal)\s+/i, "")
      .trim();

  const sanitize = (s: string) =>
    s
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .trim();

  // Extract clean candidate name (from options or resume header line 1)
  const rawCandidate =
    candidateName || (headerLines.length > 0 ? headerLines[0] : "Candidate");
  const safeCandidate = sanitize(toTitleCase(rawCandidate)) || "Candidate";

  // Extract clean position / role title from resume header line 2 or cleaned jobTitle
  let detectedRole = "";
  if (headerLines.length > 1) {
    const candidateRole = headerLines[1].trim();
    if (
      !candidateRole.includes("@") &&
      !candidateRole.includes("http") &&
      !candidateRole.includes("|")
    ) {
      detectedRole = candidateRole;
    }
  }

  const roleToUse = detectedRole || (jobTitle ? cleanRoleTitle(jobTitle) : "");
  const safePosition = sanitize(roleToUse);

  const defaultFileName = safePosition
    ? `${safeCandidate}_${safePosition}_Resume.pdf`
    : `${safeCandidate}_Resume.pdf`;

  const finalName = fileName || defaultFileName;
  doc.save(finalName);
}
