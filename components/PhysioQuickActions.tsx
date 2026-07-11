"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarPlus, ClipboardPlus, Dumbbell, Plus, UserPlus } from "lucide-react";

const actions = [
  {
    href: "/physiotherapist-portal/patients/new",
    label: "Shto pacient",
    description: "Krijo kartelë të re klinike.",
    icon: UserPlus,
  },
  {
    href: "/physiotherapist-portal/plan-builder",
    label: "Krijo plan",
    description: "Përgatit program rehabilitimi.",
    icon: ClipboardPlus,
  },
  {
    href: "/physiotherapist-portal/patients",
    label: "Regjistro seancë",
    description: "Zgjidh pacientin dhe hap kartelën.",
    icon: CalendarPlus,
  },
  {
    href: "/physiotherapist-portal/exercises#new-exercise",
    label: "Shto ushtrim",
    description: "Ruaj ushtrim privat në bibliotekë.",
    icon: Dumbbell,
  },
] as const;

export function PhysioQuickActions() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="pd-quick-actions" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="pd-quick-actions-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <Plus size={17} aria-hidden="true" />
        <span>Veprim i ri</span>
      </button>

      {open && (
        <div className="pd-quick-actions-menu" id="pd-quick-actions-menu" role="menu">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} role="menuitem" onClick={() => setOpen(false)}>
                <span className="pd-quick-actions-icon"><Icon size={18} aria-hidden="true" /></span>
                <span>
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
