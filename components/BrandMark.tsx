import Link from "next/link";
import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  href?: string;
};

export function BrandMark({ compact = false, href = "/" }: BrandMarkProps) {
  return (
    <Link className={compact ? "brand-mark compact" : "brand-mark"} href={href} aria-label="Fizioterapia ime">
      <Image
        className="brand-lockup-icon"
        src="/fizioterapia-ime-icon.svg"
        alt=""
        width={42}
        height={42}
      />
      {!compact && (
        <span className="brand-lockup-name" aria-hidden="true">
          <strong>Fizioterapia</strong>
          <em>ime</em>
        </span>
      )}
    </Link>
  );
}
