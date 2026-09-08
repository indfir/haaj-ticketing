import { cn } from "@/lib/utils";
import { type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";

function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full text-sm border-collapse", className)}
        {...props}
      />
    </div>
  );
}

function Thead({ className, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-[var(--border)] bg-[var(--muted)]",
        "sticky top-0 z-10",
        className
      )}
      {...props}
    />
  );
}

function Tbody({ className, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

function Tr({ className, ...props }: TableHTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--border)] last:border-0",
        "transition-colors duration-150 ease-out",
        "hover:bg-[var(--muted)]/50",
        className
      )}
      {...props}
    />
  );
}

function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide",
        "text-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}

function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 text-[var(--foreground)]", className)}
      {...props}
    />
  );
}

export { Table, Thead, Tbody, Tr, Th, Td };
