import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventSettings } from "./types";

// Used if the event_settings row is missing or the query fails — keeps the
// site working even before Supabase is fully wired up.
export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  id: 1,
  event_name: "COBBIT Hackathon #01",
  registration_start: "2026-08-10",
  registration_end: "2026-08-30",
  hackathon_start: "2026-08-31",
  hackathon_end: "2026-09-06",
  submission_deadline: "2026-09-06",
  prize_amount: "",
  discord_link: "",
  whatsapp_link: "https://chat.whatsapp.com/G3IJ8BOK2Xm0hiOdnoNctr",
  updated_at: ""
};

export async function getEventSettings(supabase: SupabaseClient): Promise<EventSettings> {
  const { data, error } = await supabase.from("event_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_EVENT_SETTINGS;
  return data as EventSettings;
}

// Formats "2026-08-31" -> "Aug 31, 2026"
export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// Formats a date range, collapsing the year/month when they match:
// "Aug 31 – Sep 6, 2026" instead of "Aug 31, 2026 – Sep 6, 2026"
export function formatDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso + "T00:00:00");
  const end = new Date(endIso + "T00:00:00");
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} – ${endStr}`;
}
