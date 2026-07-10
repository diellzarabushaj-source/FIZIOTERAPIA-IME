"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/physiotherapist-portal/overview", label: "Përmbledhje", icon: "⌂" },
  { href: "/physiotherapist-portal/patients", label: "Pacientët", icon: "P" },
  { href: "/physiotherapist-portal/patients/new", label: "Pacient i ri", icon: "+" },
  { href: "/physiotherapist-portal/programs", label: "Programet", icon: "R" },
  { href: "/physiotherapist-portal/exercises", label: "Ushtrimet", icon: "U" },
  { href: "/physiotherapist-portal/billing", label: "Pagesat", icon: "€" },
];

export function PhysioDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="pd-nav" aria-label="Navigimi i dashboard-it">
      {items.map((item) => {
        const active = pathname === item.href || (item.href.endsWith("/patients") && pathname.startsWith(`${item.href}/`) && !pathname.endsWith("/new"));
        return (
          <Link key={item.href} href={item.href} className={active ? "pd-nav-link active" : "pd-nav-link"}>
            <span className="pd-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
