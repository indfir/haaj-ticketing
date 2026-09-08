"use client";

interface Props {
  title: string;
  description?: string;
  location?: string;
  startAt: Date;
  endAt: Date;
  url: string;
}

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function getGoogleCalendarUrl(data: Props): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: data.title,
    dates: `${formatDate(data.startAt)}/${formatDate(data.endAt)}`,
    details: data.description ?? "",
    location: data.location ?? "",
    sf: "true",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getIcsContent(data: Props): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HAAJ//Event//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(data.startAt)}`,
    `DTEND:${formatDate(data.endAt)}`,
    `SUMMARY:${data.title}`,
    `DESCRIPTION:${(data.description ?? "").replace(/\n/g, "\\n")}`,
    `LOCATION:${data.location ?? ""}`,
    `URL:${data.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function downloadIcs(data: Props) {
  const content = getIcsContent(data);
  const blob = new Blob([content], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.title.replace(/[^a-zA-Z0-9]/g, "-")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AddToCalendar({ title, description, location, startAt, endAt, url }: Props) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Add to calendar</p>
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={getGoogleCalendarUrl({ title, description, location, startAt, endAt, url })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--border)] text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Google Calendar
        </a>
        <button
          onClick={() => downloadIcs({ title, description, location, startAt, endAt, url })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--border)] text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download .ics
        </button>
      </div>
    </div>
  );
}
