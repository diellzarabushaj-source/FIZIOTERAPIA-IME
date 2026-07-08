type BrandMarkProps = {
  compact?: boolean;
  href?: string;
};

export function BrandMark({ compact = false, href = "/" }: BrandMarkProps) {
  return (
    <a className={compact ? "brand-mark compact" : "brand-mark"} href={href} aria-label="Fizioterapia ime">
      <span className="brand-symbol" aria-hidden="true">
        <span className="brand-symbol-dot" />
        <span className="brand-symbol-spine" />
        <span className="brand-symbol-left" />
        <span className="brand-symbol-right" />
      </span>
      {!compact && (
        <span className="brand-wordmark">
          <b>Fizioterapia</b>
          <span>ime</span>
        </span>
      )}
    </a>
  );
}
