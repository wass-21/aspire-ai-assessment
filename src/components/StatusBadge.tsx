"use client";

type BookStatus = "available" | "borrowed";
type EventStatus = "upcoming" | "attending" | "maybe" | "declined";
type InvitationStatus = "pending" | "accepted" | "declined";

const bookStyles: Record<BookStatus, string> = {
  available:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
  borrowed:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700",
};

const eventStyles: Record<EventStatus, string> = {
  upcoming:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-700",
  attending:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
  maybe:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700",
  declined:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600",
};

const invitationStyles: Record<InvitationStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700",
  accepted:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
  declined:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600",
};

const baseClasses =
  "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize";

export function BookStatusBadge({ status }: { status: BookStatus }) {
  return (
    <span className={`${baseClasses} ${bookStyles[status]}`}>{status}</span>
  );
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`${baseClasses} ${eventStyles[status]}`}>{status}</span>
  );
}

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <span className={`${baseClasses} ${invitationStyles[status]}`}>
      {status}
    </span>
  );
}
