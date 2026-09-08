"use client";

import { useState, useEffect } from "react";

interface Props {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Segment({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-2xl sm:text-3xl tabular-nums"
        style={{ fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-0.5">
        {label}
      </span>
    </div>
  );
}

export function Countdown({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <p className="text-sm text-[var(--accent)]">Event is happening now!</p>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <Segment value={timeLeft.days} label="Days" />
      <span className="text-lg text-[var(--muted-foreground)] opacity-40">:</span>
      <Segment value={timeLeft.hours} label="Hrs" />
      <span className="text-lg text-[var(--muted-foreground)] opacity-40">:</span>
      <Segment value={timeLeft.minutes} label="Min" />
      <span className="text-lg text-[var(--muted-foreground)] opacity-40">:</span>
      <Segment value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
