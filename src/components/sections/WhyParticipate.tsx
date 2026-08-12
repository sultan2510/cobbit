const reasons = [
  { title: "Build something real", desc: "Go from idea to a working prototype in one week." },
  { title: "Learn AI-assisted development", desc: "Use modern LLMs, AI IDEs, and no-code tools to move faster." },
  { title: "Meet other builders", desc: "Connect with students across Pakistan who like making things." },
  { title: "Build your portfolio", desc: "Ship a project you can show in interviews and applications." },
  { title: "Compete for the prize", desc: "Top project wins a cash prize, judged by the COBBIT team." },
  { title: "Join the community", desc: "Stay connected long after the hackathon ends." }
];

export default function WhyParticipate() {
  return (
    <section className="section">
      <span className="eyebrow">Why participate</span>
      <h2 className="mt-2 max-w-xl font-display text-3xl font-700 text-charcoal md:text-4xl">
        Six reasons to show up
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r) => (
          <div key={r.title} className="card">
            <h3 className="font-display text-lg font-700 text-charcoal">{r.title}</h3>
            <p className="mt-2 text-sm text-dgray">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
