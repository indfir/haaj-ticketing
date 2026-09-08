"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  id?: string;
  name?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  /** Where to save on server: "payment-proofs" | "covers" */
  uploadFolder?: string;
  aspectSquare?: boolean;
}

export function CoverImageUpload({
  id = "coverImage",
  name = "coverImageUrl",
  label = "Cover Image",
  defaultValue = "",
  placeholder = "https://...",
  uploadFolder = "covers",
  aspectSquare = false,
}: Props) {
  const [preview, setPreview] = useState<string>(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setUploadError("");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", uploadFolder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Upload failed");
        }

        setPreview(data.fileUrl);
        // Set the hidden input value so the form submits it
        const hiddenInput = document.getElementById(id) as HTMLInputElement;
        if (hiddenInput) {
          hiddenInput.value = data.fileUrl;
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [id, uploadFolder]
  );

  const handleRemove = useCallback(() => {
    setPreview("");
    setUploadError("");
    const hiddenInput = document.getElementById(id) as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = "";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [id]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>

      {preview && (
        <div className={`relative w-full rounded-md overflow-hidden border border-[var(--border)] bg-[var(--muted)] p-1 ${aspectSquare ? "aspect-square max-w-[220px]" : "aspect-[16/9] max-w-[400px]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white text-xs font-medium flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          aria-label="Upload cover image"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-40"
        >
          {uploading ? "Uploading…" : preview ? "Change Image" : "Upload Image"}
        </button>
        <span className="text-xs text-[var(--muted-foreground)]">
          JPG, PNG, or WebP · Max 5MB
        </span>
      </div>

      {uploadError && (
        <p className="text-xs text-[var(--destructive)]" role="alert">
          {uploadError}
        </p>
      )}

      {/* Hidden input for form submission */}
      <Input
        id={id}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="hidden"
      />
    </div>
  );
}
