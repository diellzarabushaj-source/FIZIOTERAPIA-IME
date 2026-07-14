"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Dumbbell,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Palette,
  Users,
  X,
} from "lucide-react";

const items = [
  { href: "/physiotherapist-portal/overview", label: "Përmbledhje", icon: LayoutDashboard, group: "clinical" },
  { href: "/physiotherapist-portal/patients", label: "Pacientët", icon: Users, group: "clinical" },
  { href: "/physiotherapist-portal/sessions", label: "Seancat", icon: CalendarClock, group: "clinical" },
  { href: "/physiotherapist-portal/calendar", label: "Kalendari", icon: CalendarDays, group: "clinical" },
  { href: "/physiotherapist-portal/programs", label: "Programet", icon: ClipboardList, group: "clinical" },
  { href: "/physiotherapist-portal/exercises", label: "Ushtrimet", icon: Dumbbell, group: "clinical" },
  { href: "/physiotherapist-portal/reports", label: "Raportet", icon: FileText, group: "clinical" },
  { href: "/physiotherapist-portal/alerts", label: "Alarmet", icon: BellRing, group: "clinical" },
  { href: "/physiotherapist-portal/billing", label: "Pagesat", icon: CreditCard, group: "account" },
  { href: "/physiotherapist-portal/settings/branding", label: "Pamja e raporteve", icon: Palette, group: "account" },
] as const;

const mobilePrimaryItems = items.filter((item) =>
  [
    "/physiotherapist-portal/overview",
    "/physiotherapist-portal/patients",
    "/physiotherapist-portal/calendar",
  ].includes(item.href),
);

function itemIsActive(pathname: string, href: string): boolean {
  if (href.endsWith("/overview")) return pathname === href;
  if (href.endsWith("/patients")) return pathname === href || pathname.startsWith(href + "/");
  if (href.endsWith("/programs")) {
    return pathname.startsWith(href) || pathname.startsWith("/physiotherapist-portal/plan-builder");
  }
  if (href.endsWith("/reports")) {
    return pathname.startsWith(href) || pathname.startsWith("/patient-report/");
  }
  return pathname.startsWith(href);
}

export function PhysioDashboardNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const clinicalItems = items.filter((item) => item.group === "clinical");
  const accountItems = items.filter((item) => item.group === "account");

  const renderLink = (item: (typeof items)[number], onClick?: () => void) => {
    const active = itemIsActive(pathname, item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={active ? "pd-nav-link active" : "pd-nav-link"}
        aria-current={active ? "page" : undefined}
        onClick={onClick}
      >
        <span className="pd-nav-icon" aria-hidden="true"><Icon size={18} strokeWidth={2} /></span>
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <button
        className="pd-mobile-menu-button"
        type="button"
        aria-label="Hap navigimin"
        aria-expanded={open}
        aria-controls="pd-mobile-drawer"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <nav className="pd-nav" aria-label="Navigimi i dashboard-it">
        <span className="pd-nav-label">Puna klinike</span>
        {clinicalItems.map((item) => renderLink(item))}
        <span className="pd-nav-label pd-nav-account">Llogaria dhe raportet</span>
        {accountItems.map((item) => renderLink(item))}
      </nav>

      <nav className="pd-mobile-bottom-nav" aria-label="Navigimi kryesor mobile">
        {mobilePrimaryItems.map((item) => {
          const active = itemIsActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button type="button" aria-expanded={open} aria-controls="pd-mobile-drawer" onClick={() => setOpen(true)}>
          <MoreHorizontal size={20} aria-hidden="true" />
          <span>Më shumë</span>
        </button>
      </nav>

      {open && (
        <div className="pd-mobile-navigation-layer">
          <button className="pd-mobile-overlay" type="button" aria-label="Mbyll navigimin" onClick={closeMenu} />
          <aside id="pd-mobile-drawer" className="pd-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigimi i dashboard-it">
            <div className="pd-mobile-drawer-head">
              <div>
                <strong>Fizioterapia ime</strong>
                <small>CRM klinik</small>
              </div>
              <button type="button" aria-label="Mbyll navigimin" onClick={closeMenu} autoFocus>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Të gjitha seksionet">
              {items.map((item) => {
                const active = itemIsActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "active" : ""}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    <Icon size={19} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
