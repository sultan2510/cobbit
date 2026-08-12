import type { EventSettings } from "@/lib/types";

export default function Prize({ settings }: { settings: EventSettings }) {
  const hasAmount = settings.prize_amount && settings.prize_amount.trim().length > 0;

  return (
    <section className="border-y border-charcoal/8 bg-charcoal">
      <div className="section !py-16 text-center">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-peach">Prize</span>
        <h2 className="mt-3 font-display text-4xl font-800 text-cream md:text-5xl">
          {hasAmount ? `Cash prize — ${settings.prize_amount}` : "Cash prize — amount to be announced"}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-cream/60">
          {hasAmount
            ? "Awarded to the top project, judged by the COBBIT team."
            : "The prize amount will be published here as soon as it's confirmed. Check back, or watch your email after registering."}
        </p>
      </div>
    </section>
  );
}
