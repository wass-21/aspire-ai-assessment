"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:max-w-md"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ring-1 ring-black/5 dark:ring-white/5 ${
              t.type === "error"
                ? "border-l-4 border-l-red-500 border-red-200/80 bg-red-50 text-red-800 dark:border-red-700/80 dark:border-l-red-400 dark:bg-red-900/30 dark:text-red-100"
                : t.type === "info"
                  ? "border-l-4 border-l-blue-500 border-blue-200/80 bg-blue-50 text-blue-800 dark:border-blue-700/80 dark:border-l-blue-400 dark:bg-blue-900/30 dark:text-blue-100"
                  : "border-l-4 border-l-emerald-500 border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-700/80 dark:border-l-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-100"
            }`}
          >
            <span className="min-w-0 flex-1 items-center wrap-break-word text-sm font-medium leading-snug max-h-32 overflow-y-auto pr-1">
              {t.message}
            </span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="flex items-center justify-center rounded-md opacity-60 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { show: () => {} };
  return ctx;
}
