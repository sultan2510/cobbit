import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import EventOverview from "@/components/sections/EventOverview";
import WhyParticipate from "@/components/sections/WhyParticipate";
import HowItWorks from "@/components/sections/HowItWorks";
import WhoShouldJoin from "@/components/sections/WhoShouldJoin";
import Prize from "@/components/sections/Prize";
import Timeline from "@/components/sections/Timeline";
import FAQ from "@/components/sections/FAQ";
import Community from "@/components/sections/Community";
import FinalCTA from "@/components/sections/FinalCTA";
import { createClient } from "@/lib/supabase/server";
import { getEventSettings } from "@/lib/settings";

export const revalidate = 0; // always fetch fresh settings — admin edits should show up immediately

export default async function Home() {
  const supabase = createClient();
  const settings = await getEventSettings(supabase);

  return (
    <>
      <Header />
      <main>
        <Hero settings={settings} />
        <EventOverview settings={settings} />
        <WhyParticipate />
        <HowItWorks />
        <WhoShouldJoin />
        <Prize settings={settings} />
        <Timeline settings={settings} />
        <FAQ />
        <Community settings={settings} />
        <FinalCTA />
      </main>
      <Footer settings={settings} />
    </>
  );
}
