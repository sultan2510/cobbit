import Link from "next/link";
import OrganicSplash from "../OrganicSplash";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-charcoal">
      <OrganicSplash className="pointer-events-none absolute -left-32 -bottom-32 h-[480px] w-[480px] opacity-60" />
      <div className="section relative text-center">
        <h2 className="font-display text-4xl font-800 text-cream md:text-6xl">Ready to build?</h2>
        <div className="mt-8">
          <Link href="/register" className="btn-primary">
            Register for COBBIT Hackathon #01
          </Link>
        </div>
      </div>
    </section>
  );
}
