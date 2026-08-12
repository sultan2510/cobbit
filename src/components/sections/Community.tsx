import PebbleCluster from "../PebbleCluster";
import type { EventSettings } from "@/lib/types";

export default function Community({ settings }: { settings: EventSettings }) {
  const hasDiscord = settings.discord_link && settings.discord_link.trim().length > 0;
  const hasWhatsApp = settings.whatsapp_link && settings.whatsapp_link.trim().length > 0;

  return (
    <section id="community" className="section text-center">
      <PebbleCluster className="mx-auto h-8 w-28" />
      <h2 className="mt-6 font-display text-3xl font-700 text-charcoal md:text-4xl">
        Join the COBBIT community
      </h2>
      <p className="mx-auto mt-3 max-w-md text-dgray">
        Get updates, ask questions, and meet other builders before the hackathon starts.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {hasDiscord && (
          <a href={settings.discord_link} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Join Discord
          </a>
        )}
        {hasWhatsApp && (
          <a href={settings.whatsapp_link} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Join WhatsApp Community
          </a>
        )}
        {!hasDiscord && !hasWhatsApp && (
          <p className="text-xs text-dgray/60">Community links coming soon.</p>
        )}
      </div>
    </section>
  );
}
