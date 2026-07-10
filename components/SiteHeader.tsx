"use client";

import { usePathname } from "next/navigation";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const links = [
  { href: "/clinic-use", label: "Si përdoret", key: "clinic" },
  { href: "/per-pacientin", label: "Për pacientin", key: "patient" },
  { href: "/per-fizioterapeutin", label: "Për fizioterapeutin", key: "physio" },
  { href: "/#pricing", label: "Çmimi", key: "pricing" },
  { href: "/blog", label: "Blog", key: "blog" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="public-site-header-wrap">
      <nav className="top-nav landing-nav public-site-header" aria-label="Navigimi kryesor">
        <BrandMark />
        <div className="nav-actions public-site-nav-actions">
          {links.map((link) => {
            const active =
              (link.key === "blog" && pathname.startsWith("/blog")) ||
              (link.key === "patient" && pathname === "/per-pacientin") ||
              (link.key === "physio" && pathname === "/per-fizioterapeutin") ||
              (link.key === "clinic" && (pathname === "/clinic-use" || pathname === "/si-perdoret-ne-klinike"));
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
