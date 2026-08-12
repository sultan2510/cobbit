"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "./StatusBadge";
import AdminSettingsPanel from "./AdminSettingsPanel";
import type { Registration, Submission } from "@/lib/types";

type Row = Registration & { submissions: Submission[] | null };

const TABS = ["pending", "approved", "rejected", "submissions", "settings"] as const;
type Tab = (typeof TABS)[number];

export default function AdminDashboardClient() {
  const supabase = createClient();
  const router = useRouter();

  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});
  const [announcing, setAnnouncing] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("registrations")
      .select("*, submissions(*)")
      .order("created_at", { ascending: false });
    setRows((data as Row[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function viewProof(bucket: string, path: string, key: string) {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
    if (data?.signedUrl) {
      setProofUrls((prev) => ({ ...prev, [key]: data.signedUrl }));
      window.open(data.signedUrl, "_blank");
    }
  }

  async function approve(row: Row) {
    const { error } = await supabase.from("registrations").update({ status: "approved" }).eq("id", row.id);
    if (error) return alert(error.message);
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        members: row.members.map((m) => ({ email: m.email, name: m.full_name }))
      })
    });
    load();
  }

  async function reject(row: Row) {
    if (!rejectReason.trim()) return alert("Please add a reason.");
    const { error } = await supabase
      .from("registrations")
      .update({ status: "rejected", rejection_reason: rejectReason })
      .eq("id", row.id);
    if (error) return alert(error.message);
    await fetch("/api/admin/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        members: row.members.map((m) => ({ email: m.email, name: m.full_name })),
        reason: rejectReason
      })
    });
    setRejectingId(null);
    setRejectReason("");
    load();
  }

  async function announceResults(row: Row) {
    const confirmed = window.confirm(
      `This will mark "${row.type === "team" ? row.team_name : row.members[0].full_name}" as the winner, ` +
        `then generate and email a Certificate of Participation to every approved participant, plus a ` +
        `Certificate of Appreciation to this team. This runs once for the whole event — continue?`
    );
    if (!confirmed) return;

    setAnnouncing(true);
    const res = await fetch("/api/admin/announce-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winningRegistrationId: row.id })
    });
    const data = await res.json();
    setAnnouncing(false);

    if (!res.ok) {
      alert(data.error || "Something went wrong issuing certificates.");
      return;
    }
    alert(`Done — ${data.issued} certificate email(s) sent.`);
    load();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function exportCsv() {
    const header = "team_name,type,fee,status,transaction_id,leader_name,leader_email,leader_phone\n";
    const csv = rows
      .map((r) =>
        [
          r.team_name || "",
          r.type,
          r.fee_amount,
          r.status,
          r.transaction_id,
          r.members[0]?.full_name,
          r.members[0]?.email,
          r.members[0]?.phone
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cobbit-registrations.csv";
    a.click();
  }

  const filtered =
    tab === "submissions"
      ? rows.filter((r) => r.status === "approved" && r.submissions?.[0]?.status !== "not_submitted")
      : rows.filter((r) => r.status === tab);

  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length
  };

  return (
    <main className="min-h-screen bg-cream">
      <div className="border-b border-charcoal/10 bg-white/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <span className="font-display text-xl font-800 text-charcoal">COBBIT</span>
            <span className="ml-2 font-mono text-xs uppercase tracking-wide text-dgray">Admin</span>
          </div>
          <div className="flex gap-3">
            <button onClick={exportCsv} className="btn-secondary !px-4 !py-2 !text-sm">
              Export CSV
            </button>
            <button onClick={logout} className="btn-secondary !px-4 !py-2 !text-sm">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap gap-3">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide ${
                tab === t ? "bg-charcoal text-cream" : "bg-white text-dgray"
              }`}
            >
              {t}
              {t !== "submissions" && t !== "settings" && ` (${counts[t as keyof typeof counts]})`}
            </button>
          ))}
        </div>

        {tab === "settings" && <AdminSettingsPanel />}

        {tab !== "settings" && (
          <>
            {loading && <p className="mt-8 text-dgray">Loading…</p>}

            {!loading && filtered.length === 0 && <p className="mt-8 text-dgray">Nothing here yet.</p>}

            <div className="mt-6 space-y-4">
              {filtered.map((row) => {
            const leader = row.members[0];
            const submission = row.submissions?.[0];
            return (
              <div key={row.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-700 text-charcoal">
                      {row.type === "team" ? row.team_name : leader?.full_name}
                    </h3>
                    <p className="text-sm text-dgray">
                      {leader?.full_name} · {leader?.email} · {leader?.phone} · {leader?.university}
                    </p>
                    <p className="mt-1 font-mono text-xs text-dgray">
                      {row.type} · {row.fee_amount} PKR · TXN {row.transaction_id}
                    </p>
                  </div>
                  <StatusBadge status={tab === "submissions" ? submission?.status || "not_submitted" : row.status} />
                </div>

                {row.type === "team" && (
                  <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-charcoal/5 p-3 text-sm sm:grid-cols-2">
                    {row.members.slice(1).map((m, i) => (
                      <div key={i}>
                        <strong>{m.full_name}</strong> — {m.email} · {m.phone} · {m.university}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => viewProof("student-ids", leader.student_id_proof_url, row.id + "-id")}
                    className="btn-secondary !px-4 !py-2 !text-xs"
                  >
                    View student ID
                  </button>
                  <button
                    onClick={() => viewProof("payment-proofs", row.payment_screenshot_url, row.id + "-pay")}
                    className="btn-secondary !px-4 !py-2 !text-xs"
                  >
                    View payment screenshot
                  </button>
                  {submission?.repo_url && (
                    <a href={submission.repo_url} target="_blank" className="btn-secondary !px-4 !py-2 !text-xs">
                      View repo
                    </a>
                  )}
                  {submission?.demo_url && (
                    <a href={submission.demo_url} target="_blank" className="btn-secondary !px-4 !py-2 !text-xs">
                      View demo
                    </a>
                  )}
                </div>

                {tab === "pending" && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-charcoal/10 pt-4">
                    <button onClick={() => approve(row)} className="btn-primary !px-4 !py-2 !text-sm">
                      Approve
                    </button>
                    {rejectingId === row.id ? (
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <input
                          className="input flex-1 !py-2 !text-sm"
                          placeholder="Reason for rejection…"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <button onClick={() => reject(row)} className="btn-secondary !px-4 !py-2 !text-sm">
                          Confirm reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectingId(row.id)}
                        className="btn-secondary !px-4 !py-2 !text-sm"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                )}

                {tab === "submissions" && submission?.status === "submitted" && (
                  <div className="mt-4 border-t border-charcoal/10 pt-4">
                    <p className="mb-2 text-sm text-dgray">{submission.description}</p>
                    <button
                      onClick={() => announceResults(row)}
                      disabled={announcing}
                      className="btn-primary !px-4 !py-2 !text-sm"
                    >
                      {announcing ? "Issuing certificates…" : "Announce as winner & issue certificates 🏆"}
                    </button>
                    <p className="mt-2 text-xs text-dgray/70">
                      Sends a Certificate of Participation to every approved participant, plus a Certificate of
                      Appreciation to this team. Do this once, when you're ready to announce results.
                    </p>
                  </div>
                )}
                {tab === "submissions" && submission?.status === "winner" && (
                  <div className="mt-4 border-t border-charcoal/10 pt-4">
                    <p className="text-sm font-semibold text-orange">🏆 Announced as winner — certificates issued.</p>
                  </div>
                )}
              </div>
            );
          })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
