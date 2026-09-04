import { useEffect, useRef, useState } from "react";
import { glossary, type GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

/**
 * A small grey "?" circle that explains a term in plain English.
 * Opens on hover and on click (click keeps it open, for touch and for
 * people who need longer to read).
 */
export function InfoTooltip({ term, className }: { term: GlossaryKey; className?: string }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const open = pinned || hovered;

  useEffect(() => {
    if (!pinned) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setPinned(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pinned]);

  return (
    <span ref={ref} className={cn("relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label="What does this mean?"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPinned((p) => !p);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="flex size-[18px] items-center justify-center rounded-full bg-secondary text-[13px] font-semibold leading-none text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
      >
        ?
      </button>

      {open ? (
        <span
          role="tooltip"
          className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-64 -translate-x-1/2 rounded-md border border-border bg-card p-3 text-left text-[13px] font-normal leading-relaxed text-muted-foreground shadow-lift"
        >
          {glossary[term]}
        </span>
      ) : null}
    </span>
  );
}
