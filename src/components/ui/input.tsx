import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)]",
            "px-3 text-sm text-[var(--foreground)]",
            "placeholder:text-[var(--muted-foreground)]",
            "transition-colors duration-150 ease-out",
            "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]",
            "disabled:opacity-40 disabled:pointer-events-none",
            error && "border-[var(--destructive)]",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-[var(--destructive)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, type InputProps };
