"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CheckIn {
  id: string;
  ticketCode: string;
  fullName: string;
  email: string;
  eventTitle: string;
  eventSlug: string;
  checkedInAt: string;
  checkedInAtFull: string;
  method: string;
  staffName: string;
}

interface Props {
  eventId?: string;
  title?: string;
}

export function LiveCheckInFeed({ eventId, title = "Live Check-in Feed" }: Props) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCheckIns = async () => {
    try {
      const params = new URLSearchParams();
      if (eventId) params.set("eventId", eventId);
      params.set("limit", "50");

      const res = await fetch(`/api/admin/checkins?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCheckIns(data.checkIns);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch check-ins:", err);
    }
  };

  useEffect(() => {
    fetchCheckIns();

    if (isLive) {
      intervalRef.current = setInterval(fetchCheckIns, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [eventId, isLive]);

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--card)]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${isLive ? "bg-[var(--success)] animate-pulse" : "bg-[var(--muted-foreground)]"}`} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {isLive ? "LIVE" : "PAUSED"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-[var(--muted-foreground)]">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={toggleLive}>
            {isLive ? "Pause" : "Resume"}
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchCheckIns}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="divide-y divide-[var(--border)] max-h-[500px] overflow-y-auto">
        {checkIns.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">No check-ins yet</p>
          </div>
        ) : (
          checkIns.map((checkIn) => (
            <div key={checkIn.id} className="px-5 py-3 hover:bg-[var(--muted)]/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{checkIn.fullName}</p>
                    <Badge variant="muted" className="text-xs">
                      {checkIn.method}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                    {checkIn.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Link
                      href={`/events/${checkIn.eventSlug}`}
                      className="text-xs text-[var(--accent)] hover:underline truncate"
                    >
                      {checkIn.eventTitle}
                    </Link>
                    <span className="text-xs text-[var(--muted-foreground)]">•</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      by {checkIn.staffName}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono tabular-nums">{checkIn.checkedInAt}</p>
                  <p className="text-xs font-mono text-[var(--muted-foreground)]">
                    {checkIn.ticketCode}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {checkIns.length > 0 && (
        <div className="px-5 py-2 border-t border-[var(--border)] bg-[var(--muted)]/30">
          <p className="text-xs text-[var(--muted-foreground)]">
            Showing {checkIns.length} most recent check-ins
          </p>
        </div>
      )}
    </div>
  );
}
