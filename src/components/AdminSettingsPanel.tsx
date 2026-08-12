"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventSettings } from "@/lib/types";
import { DEFAULT_EVENT_SETTINGS } from "@/lib/settings";

export default function AdminSettingsPanel() {
  const supabase = createClient();
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as EventSettings);
        setLoading(false);
      });
  }, []);

  function set<K extends keyof EventSettings>(key: K, value: EventSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const { id, updated_at, ...updates } = settings;
    const { error } = await supabase
      .from("event_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSaving(false);
    if (error) return alert(error.message);
    setSaved(true);
  }

  if (loading) return <p className="mt-8 text-dgray">Loading settings…</p>;

  return (
    <div className="mt-6 max-w-2xl space-y-6">
      <div className="card space-y-4">
        <h2 className="font-display font-700 text-charcoal">Event details</h2>
        <div>
          <label className="label">Event name</label>
          <input className="input" value={settings.event_name} onChange={(e) => set("event_name", e.target.value)} />
        </div>
        <p className="text-xs text-dgray/70">
          Shown across the homepage, dashboard, and every automatic email — no code changes needed for the next
          event.
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-700 text-charcoal">Dates</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Registration opens</label>
            <input
              className="input"
              type="date"
              value={settings.registration_start}
              onChange={(e) => set("registration_start", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Registration closes</label>
            <input
              className="input"
              type="date"
              value={settings.registration_end}
              onChange={(e) => set("registration_end", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Hackathon starts</label>
            <input
              className="input"
              type="date"
              value={settings.hackathon_start}
              onChange={(e) => set("hackathon_start", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Hackathon ends</label>
            <input
              className="input"
              type="date"
              value={settings.hackathon_end}
              onChange={(e) => set("hackathon_end", e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="label">Submission deadline</label>
            <input
              className="input"
              type="date"
              value={settings.submission_deadline}
              onChange={(e) => set("submission_deadline", e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-dgray/70">
          These feed the homepage countdown, the timeline section, and the dates mentioned in registration/approval
          emails.
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-700 text-charcoal">Prize & community links</h2>
        <div>
          <label className="label">Prize amount</label>
          <input
            className="input"
            placeholder="e.g. 50,000 PKR"
            value={settings.prize_amount}
            onChange={(e) => set("prize_amount", e.target.value)}
          />
          <p className="mt-1 text-xs text-dgray/70">Leave blank to show "amount to be announced" on the site.</p>
        </div>
        <div>
          <label className="label">Discord invite link</label>
          <input
            className="input"
            placeholder="https://discord.gg/..."
            value={settings.discord_link}
            onChange={(e) => set("discord_link", e.target.value)}
          />
        </div>
        <div>
          <label className="label">WhatsApp community link</label>
          <input
            className="input"
            placeholder="https://chat.whatsapp.com/..."
            value={settings.whatsapp_link}
            onChange={(e) => set("whatsapp_link", e.target.value)}
          />
        </div>
        <p className="text-xs text-dgray/70">Leave a link blank to hide that button on the site.</p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary !px-6 !py-2.5 !text-sm">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-orange">Saved — live on the site now.</span>}
      </div>
    </div>
  );
}
