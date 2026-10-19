import { STATUS_META } from "@/lib/demo/constants";
import type { LoanStatus } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const pillClass: Record<string, string> = {
  submitted: "bg-status-submitted-bg text-status-submitted-fg",
  disbursed: "bg-status-disbursed-bg text-status-disbursed-fg",
  closed: "bg-status-closed-bg text-status-closed-fg",
  grey: "bg-status-closed-bg text-status-closed-fg",
};

export function StatusPill({
  status,
  className,
}: {
  status: LoanStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap",
        pillClass[meta.pill],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {meta.label}
    </span>
  );
}

export function OwnBuyerPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-status-closed-bg px-2 py-0.5 text-[11px] font-bold text-status-closed-fg",
        className,
      )}
    >
      Own buyer
    </span>
  );
}
