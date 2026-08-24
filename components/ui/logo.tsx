import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export function KairoLogo({
  className = "w-7 h-7",
  size = 40,
  priority = true,
}: LogoProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl shrink-0 select-none flex items-center justify-center ${className}`}
    >
      <Image
        src="/kairo.png"
        alt="Kairo Logo"
        width={size}
        height={size}
        priority={priority}
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}
