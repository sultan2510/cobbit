import { formatDate, formatDateRange } from "@/lib/settings";
import type { EventSettings } from "@/lib/types";

export default function Timeline({ settings }: { settings: EventSettings }) {
  const items = [
    {
      period: formatDateRange(settings.registration_start, settings.registration_end),
      title: "Registration open",
      desc: "Register and get your payment approved."
    },
    {
      period: formatDateRange(settings.hackathon_start, settings.hackathon_end),
      title: "Hackathon week",
      desc: "Build your project remotely."
    },
    {
      period: formatDate(settings.submission_deadline),
      title: "Submission deadline",
      desc: "Submit your project through your dashboard."
    },
    { period: `After ${formatDate(settings.submission_deadline)}`, title: "Judging", desc: "The COBBIT team reviews all submissions." },
    { period: "TBA", title: "Winners announced", desc: "Results shared with all participants." }
  ];

  return (
    <section className="section">
      <span className="eyebrow">Timeline</span>
      <h2 className="mt-2 font-display text-3xl font-700 text-charcoal md:text-4xl">Key dates</h2>
      <div className="mt-10 space-y-0 divide-y divide-charcoal/10 border-y border-charcoal/10">
        {items.map((it) => (
          <div key={it.title} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:gap-8">
            <span className="w-40 shrink-0 font-mono text-sm font-semibold text-orange">{it.period}</span>
            <span className="w-48 shrink-0 font-display text-base font-700 text-charcoal">{it.title}</span>
            <span className="text-sm text-dgray">{it.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
