// A soft, blobby orange splash used as a background accent — never a full
// gradient panel. Echoes the logo's watercolor splash, kept quiet via low
// opacity and generous blur.
export default function OrganicSplash({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="splash-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      <path
        d="M300,80 C400,60 520,140 520,260 C520,380 440,480 310,510 C180,540 80,460 70,330 C60,200 180,105 300,80 Z"
        fill="#FF6A1A"
        opacity="0.16"
        filter="url(#splash-blur)"
      />
    </svg>
  );
}
