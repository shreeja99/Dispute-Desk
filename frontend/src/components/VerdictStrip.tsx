import type { Verdict } from "@/lib/disputes";
import { cn } from "@/lib/utils";

export const verdictBg: Record<Verdict, string> = {
  FIGHT: "bg-success",
  HUMAN_REVIEW: "bg-warning",
  DROP: "bg-danger",
};

export const verdictText: Record<Verdict, string> = {
  FIGHT: "text-success",
  HUMAN_REVIEW: "text-warning",
  DROP: "text-danger",
};

export const verdictSoft: Record<Verdict, string> = {
  FIGHT: "bg-success-soft",
  HUMAN_REVIEW: "bg-warning-soft",
  DROP: "bg-danger-soft",
};

/** 4px colored bar that sits at the top edge of a card. */
export function VerdictStrip({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "strip-enter h-1 w-full origin-left rounded-t-lg",
        verdictBg[verdict],
        className,
      )}
    />
  );
}

export function VerdictLabel({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  const text = verdict === "HUMAN_REVIEW" ? "HUMAN REVIEW" : verdict;
  return (
    <span
      className={cn(
        "text-[13px] font-bold tracking-[0.06em]",
        verdictText[verdict],
        className,
      )}
    >
      {text}
    </span>
  );
}
