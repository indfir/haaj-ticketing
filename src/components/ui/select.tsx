"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <select
          ref={ref}
          id={id}
          className={cn(
            "h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)]",
            "px-3 text-sm text-[var(--foreground)] appearance-none",
            "transition-colors duration-150 ease-out",
            "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]",
            "disabled:opacity-40 disabled:pointer-events-none",
            error && "border-[var(--destructive)]",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${id}-error`} className="text-xs text-[var(--destructive)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select, type SelectProps };
