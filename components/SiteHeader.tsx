"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AuthControls } from "@/components/AuthControls";
import { BrandMark } from "@/components/BrandMark";

const links = [
  { href: "/clinic-use", label: "Si funksionon", key: "clinic" },
  { href: "/per-fizioterapeutin", label: "Për fizioterapeutin", key: "physio" },
  { href: "/per-pacientin", label: "Për pacientin", key: "patient" },
  { href: "/cmimi", label: "Çmimi", key: "pricing" },
  { href: "/support", label: "Ndihmë", key: "support" },
] as const;

function linkIsActive(pathname: string, key: (typeof links)[number]["key"]) {
  return (
    (key === "support" && pathname === "/support") ||
    (key === "pricing" && pathname === "/cmimi") ||
    (key === "patient" && pathname === "/per-pacientin") ||
    (key === "physio" && pathname === "/per-fizioterapeutin") ||
    (key === "clinic" && (pathname === "/clinic-use" || pathname === "/si-perdoret-ne-klinike"))
  );
}

function HeaderLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return links.map((link) => {
    const active = linkIsActive(pathname, link.key);
    return (
      <Link
        key={link.key}
        className={active ? "active" : undefined}
        href={link.href}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    );
  });
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="public-site-header-wrap">
      <nav className="top-nav landing-nav public-site-header" aria-label="Navigimi kryesor">
        <BrandMark />

        <div className="nav-actions public-site-nav-actions public-site-desktop-nav">
          <HeaderLinks pathname={pathname} />
          <AuthControls />
        </div>

        <button
          type="button"
          className="public-site-menu-button"
          aria-label={menuOpen ? "Mbyll menunë" : "Hap menunë"}
          aria-expanded={menuOpen}
          aria-controls="public-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <div
          id="public-mobile-menu"
          className={menuOpen ? "public-site-mobile-menu open" : "public-site-mobile-menu"}
          hidden={!menuOpen}
        >
          <div className="public-site-mobile-links">
            <HeaderLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          </div>
          <div className="public-site-mobile-auth"><AuthControls /></div>
        </div>
      </nav>
    </header>
  );
}
