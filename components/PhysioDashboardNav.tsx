"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";

const items = [
  { href: "/physiotherapist-portal/overview", label: "Përmbledhje", icon: LayoutDashboard },
  { href: "/physiotherapist-portal/patients", label: "Pacientët", icon: Users },
  { href: "/physiotherapist-portal/patients/new", label: "Pacient i ri", icon: UserPlus },
  { href: "/physiotherapist-portal/programs", label: "Programet", icon: ClipboardList },
  { href: "/physiotherapist-portal/exercises", label: "Ushtrimet", icon: Dumbbell },
  { href: "/physiotherapist-portal/billing", label: "Pagesat", icon: CreditCard },
] as const;

function itemIsActive(pathname: string, href: string): boolean {
  if (href.endsWith("/overview")) return pathname === href;
  if (href.endsWith("/patients/new")) return pathname === href;
  if (href.endsWith("/patients")) {
    return pathname.startsWith(href + "/") && !pathname.endsWith("/new");
  }
  if (href.endsWith("/programs")) {
    return pathname.startsWith(href) || pathname.startsWith("/physiotherapist-portal/plan-builder");
  }
  return pathname.startsWith(href);
}

export function PhysioDashboardNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="pd-nav" aria-label="Navigimi i dashboard-it">
        {items.map((item) => {
          const active = itemIsActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "pd-nav-link active" : "pd-nav-link"}
              aria-current={active ? "page" : undefined}
            >
              <span className="pd-nav-icon" aria-hidden="true"><Icon size={18} strokeWidth={2} /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link className="pd-create-plan" href="/physiotherapist-portal/plan-builder">
        <Plus size={18} />
        Krijo plan
      </Link>
    </>
  );
}
