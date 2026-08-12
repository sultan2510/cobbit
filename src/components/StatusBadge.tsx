const styles: Record<string, string> = {
  pending: "bg-peach/40 text-dgray",
  approved: "bg-orange/15 text-orange",
  rejected: "bg-charcoal/10 text-charcoal",
  not_submitted: "bg-charcoal/10 text-dgray",
  submitted: "bg-orange/15 text-orange",
  winner: "bg-orange text-cream"
};

const labels: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  not_submitted: "Not submitted",
  submitted: "Submitted",
  winner: "Winner 🏆"
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide ${styles[status] || "bg-charcoal/10 text-dgray"}`}>
      {labels[status] || status}
    </span>
  );
}
