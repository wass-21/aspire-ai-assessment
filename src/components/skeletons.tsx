"use client";

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"
            style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }}
          />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <div className="h-4 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300 ${className}`}
      aria-hidden
    />
  );
}
