import { ExternalLink, Image as ImageIcon, PlayCircle } from "lucide-react";
import styles from "./ExerciseMediaPreview.module.css";

type ExerciseMediaPreviewProps = {
  url?: string | null;
  title: string;
  compact?: boolean;
};

function youtubeEmbed(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

export function exerciseMediaKind(url?: string | null): "image" | "video" | "youtube" | "link" | "none" {
  if (!url) return "none";
  if (youtubeEmbed(url)) return "youtube";
  if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) return "image";
  if (/\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)) return "video";
  return "link";
}

export function ExerciseMediaPreview({ url, title, compact = false }: ExerciseMediaPreviewProps) {
  const kind = exerciseMediaKind(url);

  if (!url || kind === "none") {
    return (
      <div className={styles.frame}>
        <div className={styles.placeholder}>
          <ImageIcon size={compact ? 20 : 28} aria-hidden="true" />
          <span>Pa foto ose video</span>
        </div>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div className={styles.frame}>
        <img src={url} alt={`Demonstrim i ushtrimit ${title}`} loading="lazy" />
        <a className={styles.link} href={url} target="_blank" rel="noreferrer" aria-label={`Hap foton e ${title}`}>
          <ExternalLink size={14} />
          Hape
        </a>
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className={styles.frame}>
        <video src={url} controls={compact} muted playsInline preload="metadata" aria-label={`Video e ushtrimit ${title}`} />
        {!compact && (
          <a className={styles.link} href={url} target="_blank" rel="noreferrer" aria-label={`Hap videon e ${title}`}>
            <PlayCircle size={14} />
            Shiko
          </a>
        )}
      </div>
    );
  }

  const embed = youtubeEmbed(url);
  if (embed && !compact) {
    return (
      <div className={styles.frame}>
        <iframe
          src={embed}
          title={`Video e ushtrimit ${title}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      <div className={styles.placeholder}>
        <PlayCircle size={compact ? 20 : 28} aria-hidden="true" />
        <span>Media e ushtrimit</span>
      </div>
      <a className={styles.link} href={url} target="_blank" rel="noreferrer">
        <ExternalLink size={14} />
        Hape
      </a>
    </div>
  );
}
