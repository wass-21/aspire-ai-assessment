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
        className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:max-w-sm"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg ${
              t.type === "error"
                ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                : t.type === "info"
                  ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            }`}
          >
            <span className="text-sm font-medium">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="shrink-0 rounded p-1 opacity-70 hover:opacity-100"
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
