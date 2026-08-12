"use client";
import { useState } from "react";

const faqs = [
  { q: "Who can participate?", a: "Undergraduate university students studying in Pakistan." },
  { q: "Do I need to be an expert programmer?", a: "No. COBBIT is built around AI-assisted development, so you can participate even as a beginner." },
  { q: "Can I use AI?", a: "Yes — using LLMs, AI coding assistants, and AI-assisted IDEs is encouraged." },
  { q: "Can I participate remotely?", a: "Yes, the entire hackathon is remote." },
  { q: "Can I work in a team?", a: "Yes, teams of up to 3 members are allowed, or you can register individually." },
  { q: "What can I build?", a: "Any working software project — app, website, or prototype/MVP." },
  { q: "How does judging work?", a: "Submissions are reviewed and judged by the COBBIT team. Full judging criteria will be shared closer to the deadline." },
  { q: "What happens after I register?", a: "Your registration is reviewed once payment is confirmed. You'll get an email and can track status on your dashboard." }
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-y border-charcoal/8 bg-white/50">
      <div className="section max-w-3xl">
        <span className="eyebrow">FAQ</span>
        <h2 className="mt-2 font-display text-3xl font-700 text-charcoal md:text-4xl">Common questions</h2>
        <div className="mt-8 divide-y divide-charcoal/10 border-y border-charcoal/10">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="font-display text-base font-700 text-charcoal">{f.q}</span>
                <span className="ml-4 shrink-0 font-mono text-orange">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="pb-5 text-sm text-dgray">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
