import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium text-[var(--foreground)]",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-[var(--destructive)] ml-0.5" aria-hidden>
            *
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = "Label";

export { Label, type LabelProps };
