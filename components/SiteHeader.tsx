"use client";

import { usePathname } from "next/navigation";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const links = [
  { href: "/#how", label: "Si funksionon", key: "how" },
  { href: "/#patient", label: "Për pacientin", key: "patient" },
  { href: "/#physio", label: "Për fizioterapeutin", key: "physio" },
  { href: "/#pricing", label: "Çmimi", key: "pricing" },
  { href: "/blog", label: "Blog", key: "blog" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isBlog = pathname.startsWith("/blog");

  return (
    <header className="public-site-header-wrap">
      <nav className="top-nav landing-nav public-site-header" aria-label="Navigimi kryesor">
        <BrandMark />
        <div className="nav-actions public-site-nav-actions">
          {links.map((link) => {
            const active = link.key === "blog" && isBlog;
            return (
              <a key={link.key} className={active ? "active" : undefined} href={link.href}>
                {link.label}
              </a>
            );
          })}
          <AuthControls />
        </div>
      </nav>
    </header>
  );
}
