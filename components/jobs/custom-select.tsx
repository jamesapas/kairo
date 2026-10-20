"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  prefixIcon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  width?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  prefixIcon,
  placeholder,
  className = "",
  width,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width?: number }>({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setIsOpen(false);
        return;
      }

      const dropdownHeight = Math.min(options.length * 38 + 16, 260);
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      let parsedWidth = rect.width;
      if (width) {
        const match = width.match(/^(\d+)/);
        if (match) {
          parsedWidth = parseInt(match[1], 10);
        }
      }

      const left = Math.max(8, Math.min(rect.left, window.innerWidth - parsedWidth - 8));

      setCoords({
        top: openUpward ? Math.max(8, rect.top - dropdownHeight - 6) : rect.bottom + 6,
        left,
        width: rect.width,
      });
    }
  }, [options.length, width]);

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleScroll = (event: Event) => {
      // Do not close when scrolling inside the dropdown itself
      if (
        dropdownRef.current &&
        (dropdownRef.current === event.target ||
          dropdownRef.current.contains(event.target as Node))
      ) {
        return;
      }
      updateCoords();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updateCoords);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updateCoords);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updateCoords]);

  const isFullWidth = className.includes("w-full");

  return (
    <div className={`relative ${isFullWidth ? "w-full" : "inline-block"} ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) {
            updateCoords();
          }
          setIsOpen(!isOpen);
        }}
        className={`rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer shadow-2xs select-none ${
          isFullWidth
            ? "flex w-full items-center justify-between px-3.5 py-2"
            : "inline-flex items-center gap-1.5 px-3 py-1.5"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon ? selectedOption.icon : prefixIcon}
          <span className="truncate">{selectedOption ? selectedOption.label : (value || placeholder || "Select...")}</span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-zinc-400 dark:text-zinc-500 transition-transform duration-150 shrink-0 ml-1 ${
            isOpen ? "rotate-180 text-zinc-600 dark:text-zinc-300" : ""
          }`}
        />
      </button>

      {/* Floating Portal Menu */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: width || (coords.width ? `${coords.width}px` : "auto"),
              zIndex: 9999,
              maxHeight: "260px",
            }}
            className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl py-1.5 overflow-y-auto overscroll-contain animate-fade-in"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-zinc-100/90 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white stroke-[2.5] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
