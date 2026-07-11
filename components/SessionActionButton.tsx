"use client";

import { useFormStatus } from "react-dom";

export function SessionActionButton({
  children,
  className,
  confirmMessage,
}: {
  children: React.ReactNode;
  className: string;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {pending ? "Duke ruajtur…" : children}
    </button>
  );
}
