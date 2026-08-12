const steps = [
  { n: "01", title: "Register", desc: "Sign up solo or as a team of three and pay the registration fee." },
  { n: "02", title: "Join the community", desc: "Get added to the official Discord and WhatsApp group." },
  { n: "03", title: "Build", desc: "Build your project between August 31 and September 6." },
  { n: "04", title: "Submit", desc: "Submit your project before the deadline through your dashboard." },
  { n: "05", title: "Judging", desc: "The COBBIT team reviews every submission." },
  { n: "06", title: "Winners announced", desc: "Results are announced and the winner is notified by email." }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-charcoal/8 bg-white/50">
      <div className="section">
        <span className="eyebrow">How it works</span>
        <h2 className="mt-2 max-w-xl font-display text-3xl font-700 text-charcoal md:text-4xl">
          Six steps, start to finish
        </h2>
        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="font-mono text-sm font-bold text-orange">{s.n}</span>
              <div>
                <h3 className="font-display text-base font-700 text-charcoal">{s.title}</h3>
                <p className="mt-1 text-sm text-dgray">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
