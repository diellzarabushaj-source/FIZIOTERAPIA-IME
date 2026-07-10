"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export function PublicSiteChrome() {
  const pathname = usePathname();
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/blog") ||
    pathname === "/si-perdoret-ne-klinike" ||
    pathname === "/clinic-use" ||
    pathname === "/per-fizioterapeutin" ||
    pathname === "/per-pacientin" ||
    pathname === "/cmimi" ||
    pathname === "/support" ||
    pathname === "/contact";

  if (!isPublic) return null;
  return <div className="public-site-chrome"><SiteHeader /></div>;
}
