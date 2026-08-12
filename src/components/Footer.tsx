import PebbleCluster from "./PebbleCluster";
import { formatDateRange } from "@/lib/settings";
import type { EventSettings } from "@/lib/types";

export default function Footer({ settings }: { settings: EventSettings }) {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal text-cream">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="font-display text-2xl font-800">COBBIT</div>
            <p className="mt-2 max-w-xs text-sm text-cream/60">
              Make building accessible. A developer ecosystem connecting students, developers, startups, and enterprises.
            </p>
          </div>
          <PebbleCluster variant="mono" className="h-8 w-24 opacity-70" />
        </div>
        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-4 border-t border-cream/10 pt-6 text-xs text-cream/50 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} COBBIT. All rights reserved.</span>
          <span className="font-mono">
            {settings.event_name} · {formatDateRange(settings.hackathon_start, settings.hackathon_end)}
          </span>
        </div>
      </div>
    </footer>
  );
}
