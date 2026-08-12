"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Cert = {
  id: string;
  recipient_name: string;
  type: "participation" | "appreciation";
  storage_path: string;
  issued_at: string;
};

export default function CertificatesList({ registrationId }: { registrationId: string }) {
  const supabase = createClient();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("certificates")
      .select("*")
      .eq("registration_id", registrationId)
      .order("issued_at", { ascending: false })
      .then(({ data }) => {
        setCerts((data as Cert[]) || []);
        setLoading(false);
      });
  }, [registrationId]);

  async function download(cert: Cert) {
    const { data } = await supabase.storage.from("certificates").createSignedUrl(cert.storage_path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  if (loading) return null;
  if (certs.length === 0) return null;

  return (
    <div className="card">
      <h2 className="font-display font-700 text-charcoal">Certificates</h2>
      <div className="mt-3 space-y-2">
        {certs.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl bg-charcoal/5 p-3 text-sm">
            <span>
              {c.type === "appreciation" ? "Certificate of Appreciation" : "Certificate of Participation"} —{" "}
              {c.recipient_name}
            </span>
            <button onClick={() => download(c)} className="font-semibold text-orange">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
