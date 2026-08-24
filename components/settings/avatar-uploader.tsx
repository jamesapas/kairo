"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Trash2, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AvatarUploaderProps {
  avatarUrl?: string;
  name?: string;
  onAvatarChange: (newUrl: string) => void;
}

export function AvatarUploader({
  avatarUrl,
  name,
  onAvatarChange,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (text?: string) => {
    if (!text) return "U";
    const parts = text.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to upload an avatar.");
      }

      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        // Fallback: convert to base64 Data URL if storage bucket has issue
        console.warn("Storage upload fallback to data URL:", uploadError.message);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            onAvatarChange(reader.result);
            setUploading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      onAvatarChange(publicUrl);
    } catch (err: unknown) {
      console.error("Avatar upload failed:", err);
      setError((err as Error)?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onAvatarChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
      {/* Avatar Preview */}
      <div className="relative group shrink-0">
        <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200/90 dark:border-zinc-700/80 shadow-md flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar preview"
              width={80}
              height={80}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-xl select-none">
              {name ? getInitials(name) : <User className="w-7 h-7 text-zinc-400" />}
            </div>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Upload & Remove Controls */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-upload-input"
          />
          <label
            htmlFor="avatar-upload-input"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
          </label>

          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          PNG, JPG, or WebP up to 5MB. Recommended size 400x400.
        </p>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
