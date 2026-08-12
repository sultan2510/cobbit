import Link from "next/link";
import OrganicSplash from "../OrganicSplash";
import PebbleCluster from "../PebbleCluster";
import { formatDateRange } from "@/lib/settings";
import type { EventSettings } from "@/lib/types";

export default function Hero({ settings }: { settings: EventSettings }) {
  return (
    <section className="relative overflow-hidden">
      <OrganicSplash className="pointer-events-none absolute -right-40 -top-32 h-[560px] w-[560px]" />
      <div className="section relative pt-16 pb-24 md:pt-24">
        <span className="eyebrow">
          {settings.event_name} · Remote · {formatDateRange(settings.hackathon_start, settings.hackathon_end)}
        </span>
        <h1 className="mt-5 max-w-3xl font-display text-5xl font-800 leading-[1.05] tracking-tight text-charcoal md:text-7xl">
          Build what
          <br />
          matters.
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg text-dgray md:text-xl">
          A remote hackathon for Pakistani university students. Take an idea from zero to a working
          app, using modern AI-assisted development tools — no matter your experience level.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link href="/register" className="btn-primary">
            Register for hackathon
          </Link>
          <a href="#community" className="btn-secondary">
            Join the COBBIT community
          </a>
        </div>
        <PebbleCluster className="mt-14 h-10 w-32" />
      </div>
    </section>
  );
}
