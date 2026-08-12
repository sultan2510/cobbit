import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/8 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="font-display text-2xl font-800 tracking-tight text-charcoal">
          COBBIT
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#event" className="font-body text-sm font-medium text-dgray hover:text-charcoal">
            Event
          </a>
          <a href="/#how-it-works" className="font-body text-sm font-medium text-dgray hover:text-charcoal">
            How it works
          </a>
          <a href="/#faq" className="font-body text-sm font-medium text-dgray hover:text-charcoal">
            FAQ
          </a>
          <Link href="/login" className="font-body text-sm font-medium text-dgray hover:text-charcoal">
            Log in
          </Link>
        </nav>
        <Link href="/register" className="btn-primary !px-5 !py-2.5 !text-sm">
          Register
        </Link>
      </div>
    </header>
  );
}
