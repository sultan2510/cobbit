import CountdownTimer from "../CountdownTimer";
import { formatDateRange } from "@/lib/settings";
import type { EventSettings } from "@/lib/types";

export default function EventOverview({ settings }: { settings: EventSettings }) {
  // Assumes Pakistan time (UTC+5) for the countdown target — adjust here if the event ever runs on a different clock.
  const countdownTarget = `${settings.hackathon_start}T00:00:00+05:00`;

  return (
    <section id="event" className="border-y border-charcoal/8 bg-white/50">
      <div className="section !py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <h2 className="font-display text-2xl font-700 text-charcoal">{settings.event_name}</h2>
            <p className="mt-2 max-w-sm text-dgray">
              Build a working software project using modern development and AI tools. Solo or in a team of three.
            </p>
            <div className="mt-6 flex flex-wrap gap-8">
              <div>
                <span className="eyebrow">When</span>
                <p className="mt-1 font-body font-semibold text-charcoal">
                  {formatDateRange(settings.hackathon_start, settings.hackathon_end)}
                </p>
              </div>
              <div>
                <span className="eyebrow">Where</span>
                <p className="mt-1 font-body font-semibold text-charcoal">Remote — anywhere in Pakistan</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 md:flex md:justify-end">
            <CountdownTimer target={countdownTarget} label="Hackathon starts in" />
          </div>
        </div>
      </div>
    </section>
  );
}
