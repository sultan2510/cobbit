export default function WhoShouldJoin() {
  return (
    <section className="section">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="eyebrow">Who should join</span>
          <h2 className="mt-2 font-display text-3xl font-700 text-charcoal md:text-4xl">
            University students and aspiring builders
          </h2>
          <p className="mt-4 text-dgray">
            You don't need to be an expert programmer. COBBIT is built around modern AI-assisted
            development — LLMs, AI coding assistants, and no-code tools that let you turn an idea
            into a working product faster than ever.
          </p>
        </div>
        <div className="card">
          <ul className="space-y-3 text-sm text-charcoal">
            <li>· Open to undergraduate students across Pakistan</li>
            <li>· No prior hackathon experience required</li>
            <li>· Beginners welcome — AI tools are part of the process</li>
            <li>· Interested in software, AI, cybersecurity, or product? You'll fit right in</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
