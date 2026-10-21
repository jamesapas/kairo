"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading3,
  Eraser,
} from "lucide-react";
import {
  isHtmlContent,
  plainTextToRichHtml,
  resolvePastedContent,
  richHtmlToPlainText,
} from "@/lib/utils/job-description";

interface JobDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
}

export function JobDescriptionEditor({
  value,
  onChange,
  placeholder = "Paste the job description, qualifications, and role scope here... Bullets, bold headings, and lists are preserved automatically.",
  minHeight = "160px",
  maxHeight = "320px",
  className = "",
}: JobDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value || !value.trim());
  const [wordCount, setWordCount] = useState(0);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    bulletList: false,
    numberList: false,
  });

  // Calculate word count from HTML or plain text
  const updateCounts = useCallback((content: string) => {
    const plain = richHtmlToPlainText(content).trim();
    if (!plain) {
      setWordCount(0);
      setIsEmpty(true);
      return;
    }
    setIsEmpty(false);
    const words = plain.split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, []);

  // Update active state of toolbar buttons based on selection
  const updateActiveStates = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      setActiveStyles({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        bulletList: document.queryCommandState("insertUnorderedList"),
        numberList: document.queryCommandState("insertOrderedList"),
      });
    } catch {
      // Ignore if document not focused
    }
  }, []);

  // Sync content back to parent
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const plainText = editorRef.current.textContent?.trim() || "";

    if (!plainText && (currentHtml === "<p><br></p>" || currentHtml === "<br>")) {
      editorRef.current.innerHTML = "";
      onChange("");
      updateCounts("");
    } else {
      onChange(currentHtml);
      updateCounts(currentHtml);
    }
    updateActiveStates();
  }, [onChange, updateCounts, updateActiveStates]);

  // Sync value from prop into editor DOM if changed externally
  useEffect(() => {
    if (!editorRef.current) return;

    const currentInner = editorRef.current.innerHTML;

    // Check if external value differs meaningfully
    if (value !== currentInner) {
      if (!value) {
        editorRef.current.innerHTML = "";
      } else if (!isHtmlContent(value)) {
        // Legacy or plain text -> convert to rich HTML for editing
        editorRef.current.innerHTML = plainTextToRichHtml(value);
      } else {
        editorRef.current.innerHTML = value;
      }
      updateCounts(editorRef.current.innerHTML);
    }
  }, [value, updateCounts]);

  // Execute rich text formatting commands
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === "heading") {
      const isH3 = document.queryCommandValue("formatBlock") === "h3";
      document.execCommand("formatBlock", false, isH3 ? "<p>" : "<h3>");
    } else {
      document.execCommand(command, false, arg);
    }

    handleContentChange();
  };

  // Helper to reliably insert HTML nodes directly into current selection / cursor
  const insertHtmlAtCursor = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const sel = window.getSelection();
    let range: Range | null = null;

    if (sel && sel.rangeCount > 0) {
      const candidateRange = sel.getRangeAt(0);
      if (editorRef.current.contains(candidateRange.commonAncestorContainer)) {
        range = candidateRange;
      }
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    range.deleteContents();

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const frag = document.createDocumentFragment();
    let lastNode: Node | null = null;
    while (tempDiv.firstChild) {
      lastNode = tempDiv.firstChild;
      frag.appendChild(tempDiv.firstChild);
    }

    range.insertNode(frag);

    if (lastNode && sel) {
      const newRange = document.createRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  };

  // Smart Paste Handler: parses and preserves bullets and formatting
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData("text/html");
    const plainData = clipboardData.getData("text/plain");

    const cleanHtml = resolvePastedContent(htmlData, plainData);

    if (cleanHtml) {
      insertHtmlAtCursor(cleanHtml);
      handleContentChange();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      executeCommand("bold");
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      executeCommand("italic");
    }
  };

  return (
    <div
      className={`rounded-xl border bg-zinc-50 dark:bg-zinc-800/80 transition overflow-hidden flex flex-col ${
        isFocused
          ? "border-zinc-400 dark:border-zinc-500 shadow-xs"
          : "border-zinc-200 dark:border-zinc-700"
      } ${className}`}
    >
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-100/70 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 select-none">
        <div className="flex items-center gap-0.5">
          {/* Bold */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("bold")}
            className={`p-1.5 rounded-lg text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer ${
              activeStyles.bold
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-950 dark:text-white"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("italic")}
            className={`p-1.5 rounded-lg text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer ${
              activeStyles.italic
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-950 dark:text-white"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Section Heading */}
          <button
            type="button"
            title="Heading / Section Title"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("heading")}
            className="p-1.5 rounded-lg text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            title="Bullet List"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("insertUnorderedList")}
            className={`p-1.5 rounded-lg text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer ${
              activeStyles.bulletList
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-950 dark:text-white"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            title="Numbered List"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("insertOrderedList")}
            className={`p-1.5 rounded-lg text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer ${
              activeStyles.numberList
                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-950 dark:text-white"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          {/* Clear formatting */}
          <button
            type="button"
            title="Clear formatting"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("removeFormat")}
            className="p-1.5 rounded-lg text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Word Counter */}
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tight">
          {wordCount > 0 ? `${wordCount} words` : "WYSIWYG"}
        </div>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        data-empty={isEmpty}
        data-placeholder={placeholder}
        onFocus={() => {
          setIsFocused(true);
          updateActiveStates();
        }}
        onBlur={() => {
          setIsFocused(false);
          handleContentChange();
        }}
        onInput={handleContentChange}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        style={{ minHeight, maxHeight }}
        className="job-editor-area job-rich-content flex-1 w-full px-3.5 py-2.5 overflow-y-auto scrollbar-thin text-xs text-zinc-900 dark:text-zinc-100 font-normal focus:outline-hidden"
      />
    </div>
  );
}
