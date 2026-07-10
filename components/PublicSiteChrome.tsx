"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export function PublicSiteChrome() {
  const pathname = usePathname();
  const isPublic = pathname === "/" || pathname.startsWith("/blog");
  if (!isPublic) return null;
  return <div className="public-site-chrome"><SiteHeader /></div>;
}
