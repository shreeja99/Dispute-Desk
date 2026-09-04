import type { Verdict } from "@/lib/disputes";
import { cn } from "@/lib/utils";

const strokeByVerdict: Record<Verdict, string> = {
  FIGHT: "var(--success)",
  HUMAN_REVIEW: "var(--warning)",
  DROP: "var(--danger)",
};

export function CompletenessRing({
  value,
  verdict,
  size = 40,
  className,
}: {
  value: number;
  verdict: Verdict;
  size?: number;
  className?: string;
}) {
  const stroke = size <= 44 ? 4 : 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(Math.max(value, 0), 100) / 100);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Case completeness ${value} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="var(--border)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={strokeByVerdict[verdict]}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 200ms ease" }}
        />
      </svg>
      <span
        className="data-mono absolute inset-0 flex items-center justify-center"
        style={{ fontSize: size <= 44 ? 11 : 15, fontWeight: 500 }}
      >
        {value}
      </span>
    </div>
  );
}
