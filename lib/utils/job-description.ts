/**
 * Utilities for parsing, sanitizing, and formatting rich job descriptions.
 * Reliably handles rich HTML clipboard content and plain text pastes with bullets.
 */

// Unicode bullet characters (with or without following space)
const UNICODE_BULLET_REGEX = /^[\s\u00a0]*[•·▪▫◦‣⁃–—\u2022\u2023\u25E6\u2043\u2219]\s*/;
// ASCII bullet characters (require at least one space so e.g. -5 is not a bullet)
const ASCII_BULLET_REGEX = /^[\s\u00a0]*[-*+]\s+/;
// Numbered list items
const NUMBERED_LIST_REGEX = /^[\s\u00a0]*\d+[\.\)]\s+/;

/**
 * Check if a line is a bullet item
 */
export function isBulletLine(line: string): boolean {
  if (!line) return false;
  return UNICODE_BULLET_REGEX.test(line) || ASCII_BULLET_REGEX.test(line);
}

/**
 * Strip bullet marker from line
 */
export function stripBulletPrefix(line: string): string {
  if (UNICODE_BULLET_REGEX.test(line)) {
    return line.replace(UNICODE_BULLET_REGEX, "").trim();
  }
  if (ASCII_BULLET_REGEX.test(line)) {
    return line.replace(ASCII_BULLET_REGEX, "").trim();
  }
  return line.trim();
}

/**
 * Check if a line is a numbered item
 */
export function isNumberedLine(line: string): boolean {
  if (!line) return false;
  return NUMBERED_LIST_REGEX.test(line);
}

/**
 * Strip numbered prefix from line
 */
export function stripNumberPrefix(line: string): string {
  return line.replace(NUMBERED_LIST_REGEX, "").trim();
}

/**
 * Check if a string contains HTML tags
 */
export function isHtmlContent(str: string): boolean {
  if (!str) return false;
  return /<(p|ul|ol|li|strong|b|em|i|h1|h2|h3|h4|h5|h6|br|div)[\s>]/i.test(str);
}

/**
 * Convert rich HTML into clean plain text with preserved bullets (for clipboard & AI)
 */
export function richHtmlToPlainText(html: string): string {
  if (!html) return "";

  if (!isHtmlContent(html)) {
    return html.trim();
  }

  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      doc.querySelectorAll("li").forEach((li) => {
        const text = li.textContent?.trim() || "";
        const cleanText = isBulletLine(text) ? stripBulletPrefix(text) : text;
        li.textContent = `• ${cleanText}\n`;
      });

      doc.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((block) => {
        block.textContent = `${block.textContent?.trim() || ""}\n\n`;
      });

      doc.querySelectorAll("br").forEach((br) => {
        br.replaceWith("\n");
      });

      return (doc.body.textContent || "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    } catch {
      // Fallback below
    }
  }

  return html
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|h4|h5|h6|ul|ol)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Convert plain text with bullet points, dashes, numbers, or headings into semantic HTML
 */
export function plainTextToRichHtml(plain: string): string {
  if (!plain) return "";

  const lines = plain.split(/\r?\n/);
  const blocks: string[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (currentList) {
      const tag = currentList.type;
      const listHtml = `<${tag}>${currentList.items
        .map((item) => `<li>${item}</li>`)
        .join("")}</${tag}>`;
      blocks.push(listHtml);
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Check if line is a bullet item
    if (isBulletLine(rawLine)) {
      const content = stripBulletPrefix(rawLine);
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(escapeHtml(content));
      continue;
    }

    // Check if line is a numbered item
    if (isNumberedLine(rawLine)) {
      const content = stripNumberPrefix(rawLine);
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(escapeHtml(content));
      continue;
    }

    // End any ongoing list
    flushList();

    // Check if line looks like a section header (ends with colon or short uppercase)
    const isHeading =
      (trimmed.endsWith(":") && trimmed.length < 70) ||
      (trimmed.length < 45 &&
        /^[A-Z0-9\s/&,–—\-]+$/.test(trimmed) &&
        /[A-Z]/.test(trimmed));

    if (isHeading) {
      blocks.push(`<h3><strong>${escapeHtml(trimmed)}</strong></h3>`);
    } else {
      blocks.push(`<p>${escapeHtml(trimmed)}</p>`);
    }
  }

  flushList();
  return blocks.join("");
}

/**
 * Sanitize pasted HTML, preserving semantic lists, bold, and converting pseudo-bullet paragraphs to lists
 */
export function sanitizePastedHtml(html: string): string {
  if (!html) return "";

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove unwanted scripts and styling tags
    const unwanted = ["script", "style", "meta", "link", "iframe", "svg", "button", "input", "form", "noscript"];
    doc.querySelectorAll(unwanted.join(",")).forEach((el) => el.remove());

    // Clean existing li elements to prevent duplicate bullet markers
    doc.querySelectorAll("li").forEach((li) => {
      // Strip leading literal bullet characters
      const firstChild = li.firstChild;
      if (firstChild && firstChild.nodeType === Node.TEXT_NODE && firstChild.textContent) {
        firstChild.textContent = stripBulletPrefix(firstChild.textContent);
      }
    });

    // Check for paragraphs or divs that start with bullets and group them into <ul>
    const blockNodes = Array.from(doc.body.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, ul, ol"));
    for (const node of blockNodes) {
      if (node.tagName.toLowerCase() === "p" || node.tagName.toLowerCase() === "div") {
        const text = node.textContent?.trim() || "";
        if (isBulletLine(text)) {
          const cleanText = stripBulletPrefix(text);
          const li = document.createElement("li");
          li.innerHTML = escapeHtml(cleanText);

          // If previous sibling is already a UL, append to it
          const prev = node.previousElementSibling;
          if (prev && prev.tagName.toLowerCase() === "ul") {
            prev.appendChild(li);
            node.remove();
          } else {
            const ul = document.createElement("ul");
            ul.appendChild(li);
            node.replaceWith(ul);
          }
        }
      }
    }

    // Clean all attributes except href
    const allElements = doc.body.querySelectorAll("*");
    allElements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      const allowedAttrs = tagName === "a" ? ["href"] : [];
      const attrs = Array.from(el.getAttributeNames());
      for (const attr of attrs) {
        if (!allowedAttrs.includes(attr)) {
          el.removeAttribute(attr);
        }
      }

      // Normalize tag names
      if (tagName === "b") {
        const strong = document.createElement("strong");
        strong.innerHTML = el.innerHTML;
        el.replaceWith(strong);
      } else if (tagName === "i") {
        const em = document.createElement("em");
        em.innerHTML = el.innerHTML;
        el.replaceWith(em);
      } else if (["h1", "h2", "h4", "h5", "h6"].includes(tagName)) {
        const h3 = document.createElement("h3");
        h3.innerHTML = el.innerHTML;
        el.replaceWith(h3);
      }
    });

    return doc.body.innerHTML
      .replace(/<p>\s*<\/p>/gi, "")
      .replace(/<div>\s*<\/div>/gi, "")
      .trim();
  } catch {
    return html;
  }
}

/**
 * Smart paste resolution: chooses the best format from clipboard data
 */
export function resolvePastedContent(htmlData: string | undefined, plainData: string | undefined): string {
  const plain = (plainData || "").trim();
  const html = (htmlData || "").trim();

  // If plain text has explicit bullet lines or numbered lines, plainTextToRichHtml produces the cleanest lists
  const plainHasBullets = plain.split(/\r?\n/).some((line) => isBulletLine(line.trim()) || isNumberedLine(line.trim()));

  if (plainHasBullets && (!html || !/<(ul|ol)[\s>]/i.test(html))) {
    return plainTextToRichHtml(plain);
  }

  // If HTML contains real list elements or rich structure
  if (html && isHtmlContent(html)) {
    const sanitized = sanitizePastedHtml(html);
    if (sanitized) return sanitized;
  }

  // Fallback to plain text formatting
  if (plain) {
    return plainTextToRichHtml(plain);
  }

  return "";
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
