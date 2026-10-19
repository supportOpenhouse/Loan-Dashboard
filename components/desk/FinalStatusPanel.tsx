"use client";

import { Bell, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/desk/StatusPill";
import { REASONS, brokerById } from "@/lib/demo/constants";
import { formatDateTime, reasonLabel } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/store";
import type { LoanReferral, NotConvertedReason } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export function FinalStatusPanel({ referral }: { referral: LoanReferral }) {
  const { user, setFinalStatus, showToast } = useDemo();
  const isAdmin = user?.role === "admin";
  const isOpen = referral.status === "submitted";
  const [editing, setEditing] = useState(false);
  const [choice, setChoice] = useState<"disbursed" | "not_converted" | "">(
    "",
  );
  const [reason, setReason] = useState<NotConvertedReason>("client_not_reachable");
  const [remarks, setRemarks] = useState("");

  const showForm = isOpen || editing;

  const canSave = useMemo(() => {
    if (!choice) return false;
    return remarks.trim().length >= 5 && remarks.trim().length <= 500;
  }, [choice, remarks]);

  const startEdit = () => {
    setEditing(true);
    setChoice(
      referral.status === "disbursed" || referral.status === "not_converted"
        ? referral.status
        : "",
    );
    setReason(referral.reason || "client_not_reachable");
    setRemarks(referral.remarks || "");
  };

  const cancelEdit = () => {
    setEditing(false);
    setChoice("");
    setRemarks("");
  };

  const save = () => {
    if (!choice) return;
    const result = setFinalStatus(referral.id, {
      status: choice,
      reason: choice === "not_converted" ? reason : undefined,
      remarks,
    });
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    setEditing(false);
    setChoice("");
    setRemarks("");
    showToast(result.message);
  };

  const reopen = () => {
    const result = setFinalStatus(referral.id, {
      status: "submitted",
      remarks: "Reopened by admin",
    });
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast(result.message);
  };

  if (!showForm) {
    return (
      <section className="rounded-xl border border-border bg-card p-3.5">
        <h4 className="section-label mb-2.5">Final status</h4>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={referral.status} />
          <span className="text-[11.5px] text-muted-foreground">
            set {referral.setAt ? formatDateTime(referral.setAt) : ""} by{" "}
            {referral.setBy}
          </span>
        </div>
        {referral.status === "not_converted" && referral.reason && (
          <div className="mt-2 text-[13px]">
            <b>Reason:</b> {reasonLabel(referral.reason)}
          </div>
        )}
        <div className="mt-2 text-[13px]">
          <b>Remarks shown to the broker:</b> {referral.remarks}
        </div>
        {isAdmin ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startEdit}
              className="h-[34px] rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
            >
              Change final status
            </button>
            <button
              type="button"
              onClick={reopen}
              className="h-[34px] rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
            >
              Reopen
            </button>
          </div>
        ) : (
          <div className="mt-3 rounded-[9px] border border-[#cfe0ff] bg-[#eef5ff] px-2.5 py-2 text-[12px] text-[#1e3a8a]">
            Only an admin can change a final status.
          </div>
        )}
      </section>
    );
  }

  const broker = referral.brokerId ? brokerById(referral.brokerId) : null;

  return (
    <section className="rounded-xl border border-border bg-card p-3.5">
      <h4 className="section-label mb-2.5">
        {isOpen ? "Set final status" : "Change final status (admin)"}
      </h4>

      <div className="flex flex-wrap gap-1.5">
        <OutcomeBtn
          on={choice === "disbursed"}
          onClick={() => setChoice("disbursed")}
          icon={<Check className="size-3.5" strokeWidth={2.5} />}
          label="Disbursed"
        />
        <OutcomeBtn
          on={choice === "not_converted"}
          onClick={() => setChoice("not_converted")}
          icon={<X className="size-3.5" strokeWidth={2.5} />}
          label="Not converted"
        />
      </div>

      {choice === "not_converted" && (
        <div className="mt-3">
          <label className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase">
            Reason <span className="text-[#e5484d]">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as NotConvertedReason)}
            className="h-[34px] w-full rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
          >
            {Object.entries(REASONS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-3">
        <label className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase">
          Remarks for the broker <span className="text-[#e5484d]">*</span>
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value.slice(0, 500))}
          maxLength={500}
          rows={3}
          placeholder={
            choice === "disbursed"
              ? "e.g. Disbursed by HDFC Bank on 18 Dec."
              : "What happened, in a line the broker can read"
          }
          className="w-full resize-y rounded-lg border border-border px-2.5 py-2 text-[13px] outline-none focus:border-ring"
        />
        <div className="mt-1 text-[11.5px] text-muted-foreground">
          {remarks.length}/500 · shown to the broker exactly as written
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-[#f9fafb] p-2.5 text-[12.5px]">
        {!broker ? (
          <div className="text-muted-foreground">
            Own buyer: no broker to notify.
          </div>
        ) : (
          <>
            <div className="text-[11.5px] text-muted-foreground">
              {broker.name}&apos;s app after saving
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <b>{referral.client}</b>
              {choice ? (
                <StatusPill status={choice} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            <div className="mt-1">
              {choice === "not_converted"
                ? `${REASONS[reason]}. `
                : ""}
              {remarks || "…"}
            </div>
            {canSave && (
              <div className="mt-1 flex items-center gap-1 text-[11.5px] text-[#c2410c]">
                <Bell className="size-3" />
                {broker.name} gets a push.
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {editing && (
          <button
            type="button"
            onClick={cancelEdit}
            className="h-[34px] rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="h-[34px] rounded-[9px] bg-primary px-3 text-[12.5px] font-bold text-white hover:bg-[#e64a19] disabled:opacity-45"
        >
          Save final status
        </button>
      </div>
    </section>
  );
}

function OutcomeBtn({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-bold",
        on
          ? "border-foreground bg-foreground text-white"
          : "border-border bg-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
