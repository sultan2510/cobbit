"use client";

import { useEffect, useState } from "react";

function getRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

export default function CountdownTimer({
  target,
  label
}: {
  target: string; // ISO date string
  label: string;
}) {
  const [time, setTime] = useState(() => getRemaining(new Date(target)));

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(new Date(target))), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number][] = [
    ["days", time.days],
    ["hrs", time.hours],
    ["min", time.minutes],
    ["sec", time.seconds]
  ];

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <span className="eyebrow">{label}</span>
      <div className="flex gap-3">
        {units.map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center rounded-2xl bg-charcoal px-4 py-3 text-cream">
            <span className="font-mono text-2xl font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-cream/50">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
