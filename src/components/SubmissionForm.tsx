"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Submission } from "@/lib/types";

export default function SubmissionForm({ submission }: { submission: Submission }) {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState(submission.project_title || "");
  const [description, setDescription] = useState(submission.description || "");
  const [repoUrl, setRepoUrl] = useState(submission.repo_url || "");
  const [demoUrl, setDemoUrl] = useState(submission.demo_url || "");
  const [videoUrl, setVideoUrl] = useState(submission.video_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        project_title: title,
        description,
        repo_url: repoUrl,
        demo_url: demoUrl,
        video_url: videoUrl,
        status: "submitted",
        submitted_at: new Date().toISOString()
      })
      .eq("id", submission.id);
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  const isSubmitted = submission.status !== "not_submitted";

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="label">Project title</label>
        <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="label">Short description</label>
        <textarea
          className="input min-h-[100px]"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Repository link (GitHub, etc.)</label>
        <input className="input" required type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
      </div>
      <div>
        <label className="label">Live demo link (optional)</label>
        <input className="input" type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
      </div>
      <div>
        <label className="label">Video walkthrough link (optional)</label>
        <input className="input" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
      </div>
      {error && <p className="text-sm text-orange">{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Saving…" : isSubmitted ? "Update submission" : "Submit project"}
      </button>
    </form>
  );
}
