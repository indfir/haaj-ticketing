export function EventCardSkeleton() {
  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] animate-pulse">
      <div className="aspect-[16/10] bg-[var(--muted)]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-20 bg-[var(--muted)] rounded" />
        <div className="h-5 w-full bg-[var(--muted)] rounded" />
        <div className="h-3 w-3/4 bg-[var(--muted)] rounded" />
        <div className="h-3 w-1/2 bg-[var(--muted)] rounded" />
        <div className="pt-3 border-t border-[var(--border)]">
          <div className="h-3 w-24 bg-[var(--muted)] rounded" />
        </div>
      </div>
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8 sm:py-12 animate-pulse">
      <div className="h-6 w-32 bg-[var(--muted)] rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex gap-2">
            <div className="h-5 w-24 bg-[var(--muted)] rounded" />
            <div className="h-5 w-16 bg-[var(--muted)] rounded" />
          </div>
          <div className="h-10 w-3/4 bg-[var(--muted)] rounded" />
          <div className="h-4 w-full bg-[var(--muted)] rounded" />
          <div className="h-4 w-2/3 bg-[var(--muted)] rounded" />
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-12 bg-[var(--muted)] rounded" />
                <div className="h-4 w-32 bg-[var(--muted)] rounded" />
                <div className="h-3 w-20 bg-[var(--muted)] rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-12 bg-[var(--muted)] rounded" />
                <div className="h-4 w-32 bg-[var(--muted)] rounded" />
                <div className="h-3 w-20 bg-[var(--muted)] rounded" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-6 w-40 bg-[var(--muted)] rounded" />
            <div className="h-3 w-full bg-[var(--muted)] rounded" />
            <div className="h-3 w-full bg-[var(--muted)] rounded" />
            <div className="h-3 w-2/3 bg-[var(--muted)] rounded" />
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="border border-[var(--border)] rounded-lg p-5 sm:p-6 bg-[var(--card)] space-y-4">
            <div className="h-4 w-32 bg-[var(--muted)] rounded" />
            <div className="h-2 w-full bg-[var(--muted)] rounded-full" />
            <div className="h-10 w-full bg-[var(--muted)] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
