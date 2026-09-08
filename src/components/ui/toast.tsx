"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { createContext, useContext, useState, useCallback } from "react";

type ToastVariant = "default" | "success" | "destructive";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const variantStyles: Record<ToastVariant, string> = {
    default: "border-[var(--border)] bg-[var(--card)]",
    success: "border-[var(--success)]/30 bg-[var(--card)]",
    destructive: "border-[var(--destructive)]/30 bg-[var(--card)]",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={cn(
              "border rounded-lg p-4",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
              "data-[state=open]:duration-200 data-[state=closed]:duration-150",
              variantStyles[t.variant ?? "default"]
            )}
            onOpenChange={(open) => {
              if (!open) setToasts((prev) => prev.filter((x) => x.id !== t.id));
            }}
          >
            <ToastPrimitive.Title className="text-sm font-medium text-[var(--foreground)]">
              {t.title}
            </ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="mt-1 text-sm text-[var(--muted-foreground)]">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
