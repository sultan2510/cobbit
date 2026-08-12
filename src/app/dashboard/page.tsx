import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import SubmissionForm from "@/components/SubmissionForm";
import CertificatesList from "@/components/CertificatesList";
import { getEventSettings, formatDate } from "@/lib/settings";
import type { Registration, Submission } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const settings = await getEventSettings(supabase);

  const { data: registration } = await supabase
    .from("registrations")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle<Registration>();

  let submission: Submission | null = null;
  if (registration?.status === "approved") {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("registration_id", registration.id)
      .maybeSingle<Submission>();
    submission = data;
  }

  return (
    <>
      <Header />
      <main className="section max-w-2xl">
        <span className="eyebrow">Your dashboard</span>
        <h1 className="mt-2 font-display text-3xl font-800 text-charcoal">
          Hey {user.user_metadata?.full_name || "there"} 👋
        </h1>

        {!registration && (
          <div className="mt-8 card">
            <p className="text-dgray">You haven't registered yet.</p>
            <a href="/register" className="btn-primary mt-4 inline-flex">
              Register now
            </a>
          </div>
        )}

        {registration && (
          <div className="mt-8 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-700 text-charcoal">
                  {registration.type === "team" ? registration.team_name : "Individual registration"}
                </h2>
                <StatusBadge status={registration.status} />
              </div>
              <p className="mt-2 text-sm text-dgray">
                {registration.type === "team" ? "Team of 3" : "Individual"} · {registration.fee_amount} PKR ·
                Transaction ID: {registration.transaction_id}
              </p>

              {registration.status === "pending" && (
                <p className="mt-4 rounded-xl bg-peach/20 p-4 text-sm text-dgray">
                  We're reviewing your payment. This usually takes 24–48 hours.
                </p>
              )}
              {registration.status === "rejected" && (
                <p className="mt-4 rounded-xl bg-charcoal/5 p-4 text-sm text-charcoal">
                  <strong>Reason:</strong> {registration.rejection_reason || "Not specified."}
                </p>
              )}
              {registration.status === "approved" && (
                <p className="mt-4 rounded-xl bg-orange/10 p-4 text-sm text-charcoal">
                  You're confirmed for {settings.event_name}. Good luck building!
                </p>
              )}
            </div>

            {registration.status === "approved" && submission && (
              <div className="card">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-700 text-charcoal">Project submission</h2>
                  <StatusBadge status={submission.status} />
                </div>
                <p className="mt-1 text-sm text-dgray">Submissions close {formatDate(settings.submission_deadline)}.</p>
                <SubmissionForm submission={submission} />
              </div>
            )}

            {registration.status === "approved" && <CertificatesList registrationId={registration.id} />}
          </div>
        )}
      </main>
      <Footer settings={settings} />
    </>
  );
}