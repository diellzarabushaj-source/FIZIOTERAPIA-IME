"use client";

import type { FormEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

type ConfirmActionFormProps = {
  action: ServerFormAction;
  confirmMessage: string;
  className?: string;
  children: ReactNode;
};

export function ConfirmActionForm({
  action,
  confirmMessage,
  className,
  children,
}: ConfirmActionFormProps) {
  function confirmSubmission(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} className={className} onSubmit={confirmSubmission}>
      {children}
    </form>
  );
}

export function ConfirmSubmitButton({
  children,
  pendingLabel = "Duke ruajtur...",
  className,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
