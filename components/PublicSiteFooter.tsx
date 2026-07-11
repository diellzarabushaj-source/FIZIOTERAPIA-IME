"use client";

import { usePathname } from "next/navigation";
import { isPublicSitePath } from "@/lib/public-routes";
import { SiteFooter } from "@/components/SiteFooter";

export function PublicSiteFooter() {
  const pathname = usePathname();
  if (!isPublicSitePath(pathname)) return null;
  return <SiteFooter />;
}
