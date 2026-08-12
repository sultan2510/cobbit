"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Step = "loading" | "account" | "details" | "done";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState<Step>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Account fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [type, setType] = useState<"individual" | "team">("individual");
  const [teamName, setTeamName] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [universityEmail, setUniversityEmail] = useState("");
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [member2, setMember2] = useState({ full_name: "", email: "", phone: "", university: "" });
  const [member3, setMember3] = useState({ full_name: "", email: "", phone: "", university: "" });
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserId(data.session.user.id);
        setFullName(data.session.user.user_metadata?.full_name || "");
        setEmail(data.session.user.email || "");
        setStep("details");
      } else {
        setStep("account");
      }
    });
  }, []);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.user) {
      setUserId(data.user.id);
      setStep("details");
    }
  }

  async function uploadFile(file: File, bucket: string) {
    const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
    if (uploadError) throw uploadError;
    return path;
  }

  async function handleSubmitRegistration(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!studentIdFile) return setError("Please upload a student ID / university proof.");
    if (!screenshotFile) return setError("Please upload your payment screenshot.");
    if (!transactionId.trim()) return setError("Please enter your Easypaisa transaction ID.");
    if (type === "team" && (!teamName || !member2.full_name || !member3.full_name)) {
      return setError("Please fill in the team name and both teammates' details.");
    }

    setLoading(true);
    try {
      const idProofPath = await uploadFile(studentIdFile, "student-ids");
      const screenshotPath = await uploadFile(screenshotFile, "payment-proofs");

      const members = [
        {
          full_name: fullName,
          email,
          phone,
          university,
          university_email: universityEmail,
          student_id_proof_url: idProofPath
        },
        ...(type === "team"
          ? [
              { ...member2, university_email: "", student_id_proof_url: "" },
              { ...member3, university_email: "", student_id_proof_url: "" }
            ]
          : [])
      ];

      const { error: insertError } = await supabase.from("registrations").insert({
        profile_id: userId,
        type,
        team_name: type === "team" ? teamName : null,
        members,
        fee_amount: type === "team" ? 500 : 300,
        transaction_id: transactionId,
        payment_screenshot_url: screenshotPath,
        status: "pending"
      });

      if (insertError) throw insertError;

      // fire the "registration received" email — server-side, uses Resend
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName })
      });

      setStep("done");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="section max-w-xl">
        <span className="eyebrow">Registration</span>
        <h1 className="mt-2 font-display text-3xl font-800 text-charcoal md:text-4xl">
          Register for COBBIT Hackathon #01
        </h1>
        <p className="mt-2 text-sm text-dgray">Open only to university students studying in Pakistan.</p>

        {step === "loading" && <p className="mt-10 text-dgray">Loading…</p>}

        {step === "account" && (
          <form onSubmit={handleCreateAccount} className="mt-10 space-y-5">
            <div>
              <label className="label">Full name</label>
              <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-orange">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Creating account…" : "Continue"}
            </button>
            <p className="text-center text-sm text-dgray">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-orange">
                Log in
              </a>
            </p>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={handleSubmitRegistration} className="mt-10 space-y-8">
            <div>
              <label className="label">Registration type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType("individual")}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                    type === "individual" ? "border-orange bg-orange/10 text-charcoal" : "border-charcoal/15 text-dgray"
                  }`}
                >
                  Individual — 300 PKR
                </button>
                <button
                  type="button"
                  onClick={() => setType("team")}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                    type === "team" ? "border-orange bg-orange/10 text-charcoal" : "border-charcoal/15 text-dgray"
                  }`}
                >
                  Team of 3 — 500 PKR
                </button>
              </div>
            </div>

            <div className="card space-y-4">
              <h2 className="font-display font-700 text-charcoal">
                {type === "team" ? "Team leader (you)" : "Your details"}
              </h2>
              {type === "team" && (
                <div>
                  <label className="label">Team name</label>
                  <input className="input" required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                </div>
              )}
              <div>
                <label className="label">Phone number</label>
                <input className="input" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="label">University</label>
                <input className="input" required value={university} onChange={(e) => setUniversity(e.target.value)} />
              </div>
              <div>
                <label className="label">University email (optional)</label>
                <input
                  className="input"
                  type="email"
                  value={universityEmail}
                  onChange={(e) => setUniversityEmail(e.target.value)}
                  placeholder="you@university.edu.pk"
                />
              </div>
              <div>
                <label className="label">Student ID / proof of enrollment</label>
                <input
                  className="input"
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setStudentIdFile(e.target.files?.[0] || null)}
                />
                <p className="mt-1 text-xs text-dgray/70">Photo of your student card or enrollment proof.</p>
              </div>
            </div>

            {type === "team" && (
              <>
                <div className="card space-y-4">
                  <h2 className="font-display font-700 text-charcoal">Teammate 2</h2>
                  <input
                    className="input"
                    placeholder="Full name"
                    required
                    value={member2.full_name}
                    onChange={(e) => setMember2({ ...member2, full_name: e.target.value })}
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="Email"
                    required
                    value={member2.email}
                    onChange={(e) => setMember2({ ...member2, email: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Phone number"
                    required
                    value={member2.phone}
                    onChange={(e) => setMember2({ ...member2, phone: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="University"
                    required
                    value={member2.university}
                    onChange={(e) => setMember2({ ...member2, university: e.target.value })}
                  />
                </div>
                <div className="card space-y-4">
                  <h2 className="font-display font-700 text-charcoal">Teammate 3</h2>
                  <input
                    className="input"
                    placeholder="Full name"
                    required
                    value={member3.full_name}
                    onChange={(e) => setMember3({ ...member3, full_name: e.target.value })}
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="Email"
                    required
                    value={member3.email}
                    onChange={(e) => setMember3({ ...member3, email: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Phone number"
                    required
                    value={member3.phone}
                    onChange={(e) => setMember3({ ...member3, phone: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="University"
                    required
                    value={member3.university}
                    onChange={(e) => setMember3({ ...member3, university: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="card space-y-4 border-orange/30 bg-orange/5">
              <h2 className="font-display font-700 text-charcoal">Payment</h2>
              <p className="text-sm text-dgray">
                Send <strong>{type === "team" ? "500" : "300"} PKR</strong> via Easypaisa to:
              </p>
              <div className="rounded-xl bg-white p-4 font-mono text-sm">
                <div className="font-bold text-charcoal">03395505946</div>
                <div className="text-dgray">Easypaisa · Ameena Zulfiqar</div>
              </div>
              <div>
                <label className="label">Transaction ID</label>
                <input
                  className="input"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 8823456712"
                />
              </div>
              <div>
                <label className="label">Payment screenshot</label>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-orange">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Submitting…" : "Submit registration"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="mt-10 card text-center">
            <h2 className="font-display text-2xl font-700 text-charcoal">Registration received 🎉</h2>
            <p className="mt-3 text-dgray">
              We're reviewing your payment. You'll get an email once it's approved — usually within 24–48 hours.
            </p>
            <button className="btn-primary mt-6" onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
