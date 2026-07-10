"use client";

import { useEffect, useId, useState } from "react";
import {
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  LoaderCircle,
  Upload,
  Video,
  X,
} from "lucide-react";
import { createExerciseMediaUploadAction } from "@/app/physiotherapist-portal/exercises/actions";
import styles from "./ExerciseMediaUploadField.module.css";

type ExerciseMediaUploadFieldProps = {
  name?: string;
  initialUrl?: string;
  disabled?: boolean;
  label?: string;
};

function mediaKind(url: string): "image" | "video" | null {
  if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) return "image";
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return "video";
  return null;
}

export function ExerciseMediaUploadField({
  name = "mediaUrl",
  initialUrl = "",
  disabled = false,
  label = "Foto ose video e ushtrimit",
}: ExerciseMediaUploadFieldProps) {
  const inputId = useId();
  const [mediaUrl, setMediaUrl] = useState(initialUrl);
  const [manualUrl, setManualUrl] = useState(initialUrl);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [previewKind, setPreviewKind] = useState<"image" | "video" | null>(mediaKind(initialUrl));
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    setStatus("Po përgatitet upload-i i sigurt…");

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setPreviewKind(file.type.startsWith("image/") ? "image" : "video");

    try {
      const ticket = await createExerciseMediaUploadAction({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });

      if (ticket.ok === false) throw new Error(ticket.message);

      setStatus("Po ngarkohet media…");
      const response = await fetch(ticket.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": ticket.contentType,
          "Cache-Control": "3600",
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Ngarkimi dështoi. Provo përsëri me një skedar më të vogël.");
      }

      setMediaUrl(ticket.publicUrl);
      setManualUrl(ticket.publicUrl);
      setPreviewUrl(ticket.publicUrl);
      setPreviewKind(file.type.startsWith("image/") ? "image" : "video");
      setStatus("Media u ngarkua dhe është gati për ruajtje.");
    } catch (uploadError) {
      setMediaUrl("");
      setManualUrl("");
      setStatus("");
      setError(uploadError instanceof Error ? uploadError.message : "Media nuk u ngarkua.");
    } finally {
      setUploading(false);
    }
  }

  function clearMedia() {
    setMediaUrl("");
    setManualUrl("");
    setPreviewUrl("");
    setPreviewKind(null);
    setStatus("");
    setError("");
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input type="hidden" name={name} value={mediaUrl} />

      <div className={styles.uploadRow}>
        <label
          className={styles.uploadButton}
          htmlFor={inputId}
          data-disabled={disabled || uploading}
        >
          {uploading ? <LoaderCircle className={styles.spin} size={17} /> : <Upload size={17} />}
          {uploading ? "Duke ngarkuar…" : "Ngarko nga pajisja"}
        </label>
        <input
          className={styles.fileInput}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadFile(file);
            event.currentTarget.value = "";
          }}
        />
        {mediaUrl && (
          <button className={styles.clearButton} type="button" onClick={clearMedia} disabled={disabled || uploading}>
            <X size={16} />
            Largo median
          </button>
        )}
      </div>

      <label className={styles.label} htmlFor={`${inputId}-url`}>
        <Link2 size={14} aria-hidden="true" /> Ose vendos link HTTPS
      </label>
      <input
        className={styles.urlInput}
        id={`${inputId}-url`}
        type="url"
        inputMode="url"
        placeholder="https://…/ushtrimi.mp4"
        value={manualUrl}
        disabled={disabled || uploading}
        onChange={(event) => {
          const nextUrl = event.target.value;
          setManualUrl(nextUrl);
          setMediaUrl(nextUrl.trim());
          setPreviewUrl(nextUrl.trim());
          setPreviewKind(mediaKind(nextUrl.trim()));
          setStatus(nextUrl.trim() ? "Linku do të ruhet bashkë me ushtrimin." : "");
          setError("");
        }}
      />

      <p className={styles.help}>
        Foto JPG/PNG/WebP/GIF ose video MP4/WebM/MOV, deri në 50 MB. Mos ngarko materiale që përmbajnë të dhëna personale të pacientit.
      </p>

      {previewUrl && previewKind && (
        <div className={styles.preview}>
          {previewKind === "image" ? (
            <img src={previewUrl} alt="Parapamja e ushtrimit" />
          ) : (
            <video src={previewUrl} controls muted playsInline preload="metadata" aria-label="Parapamja e videos së ushtrimit" />
          )}
        </div>
      )}

      <div aria-live="polite">
        {status && (
          <p className={styles.status}>
            {previewKind === "image" ? <ImageIcon size={15} /> : previewKind === "video" ? <Video size={15} /> : <CheckCircle2 size={15} />}
            {status}
          </p>
        )}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </div>
  );
}
