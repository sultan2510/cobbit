// The signature motif: a small scattered cluster of pebbles, echoing the
// COBBIT logo. Used sparingly as section markers and dividers — never as a
// generic icon substitute.
export default function PebbleCluster({
  className = "",
  variant = "default"
}: {
  className?: string;
  variant?: "default" | "mono";
}) {
  const colors =
    variant === "mono"
      ? { a: "#A89D92", b: "#4A4A4A", c: "#1F1F1F" }
      : { a: "#A89D92", b: "#1F1F1F", c: "#FF6A1A" };

  return (
    <svg
      viewBox="0 0 120 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="18" cy="30" rx="16" ry="12" fill={colors.a} transform="rotate(-8 18 30)" />
      <ellipse cx="46" cy="20" rx="12" ry="9" fill={colors.b} transform="rotate(6 46 20)" />
      <ellipse cx="68" cy="32" rx="9" ry="7" fill={colors.c} transform="rotate(-4 68 32)" />
      <ellipse cx="90" cy="18" rx="7" ry="6" fill={colors.a} transform="rotate(10 90 18)" />
    </svg>
  );
}
