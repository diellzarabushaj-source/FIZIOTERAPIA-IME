"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { isPublicSitePath } from "@/lib/public-routes";

export function PublicSiteChrome() {
  const pathname = usePathname();
  if (!isPublicSitePath(pathname)) return null;
  return <div className="public-site-chrome"><SiteHeader /></div>;
}
