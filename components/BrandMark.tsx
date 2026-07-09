type BrandMarkProps = {
  compact?: boolean;
  href?: string;
};

export function BrandMark({ compact = false, href = "/" }: BrandMarkProps) {
  return (
    <a className={compact ? "brand-mark compact" : "brand-mark"} href={href} aria-label="Fizioterapia ime">
      <img
        className={compact ? "brand-image brand-image-icon" : "brand-image brand-image-logo"}
        src={compact ? "/fizioterapia-ime-icon.svg" : "/fizioterapia-ime-logo.svg"}
        alt=""
        aria-hidden="true"
      />
    </a>
  );
}
