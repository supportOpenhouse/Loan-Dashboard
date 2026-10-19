"use client";

import { CheckCircle2, FileSpreadsheet, Link2, Sparkles } from "lucide-react";
import { useState } from "react";
import { formatTime } from "@/lib/demo/format";
import type { LoanReferral } from "@/lib/demo/types";
import { useDemo } from "@/lib/demo/store";
import { ApplicationSteps } from "./ApplicationSteps";
import { ConsentHandoff } from "./ConsentHandoff";
import { SaathiSheetPanel } from "./SaathiSheetPanel";

export function ApplicationTab({ referral }: { referral: LoanReferral }) {
  const {
    state,
    getChecklist,
    patchApplication,
    patchApplicant,
    addCoApplicant,
    removeCoApplicant,
    prefillFromListing,
    reconfirmConsent,
    setAmbakLeadId,
    showToast,
    lastSavedAt,
  } = useDemo();

  const app = state.applications[String(referral.id)];
  const checklist = getChecklist(referral.id);
  const [saathiOpen, setSaathiOpen] = useState(false);

  if (!app) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Loading application…
      </div>
    );
  }

  const canPrefill = referral.prop.kind === "openhouse" && !!referral.prop.homeId;

  const onBlur = () => {
    /* patch already marks saved via store */
  };

  return (
    <div className="relative space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11.5px] text-muted-foreground">
          {lastSavedAt ? `Saved ${formatTime(lastSavedAt)}` : "Not saved yet"}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={!canPrefill}
            onClick={() => {
              prefillFromListing(referral.id);
              showToast("Property prefills from Openhouse listing");
            }}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold disabled:opacity-40"
            title={
              canPrefill
                ? "Fill property from OH listing"
                : "Only for Openhouse listings"
            }
          >
            <Sparkles className="size-3.5" />
            Prefill
          </button>
          <button
            type="button"
            onClick={() => setSaathiOpen(true)}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
          >
            <FileSpreadsheet className="size-3.5" />
            Saathi sheet
          </button>
          <button
            type="button"
            onClick={() =>
              showToast("Client link coming soon (demo stub)")
            }
            className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
          >
            <Link2 className="size-3.5" />
            Send client link
          </button>
        </div>
      </div>

      <section
        className={`rounded-xl border p-3.5 ${
          checklist.isComplete
            ? "border-[#86efac] bg-[#f0fdf4]"
            : "border-border bg-card"
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2
            className={`size-4 ${
              checklist.isComplete ? "text-[#15803d]" : "text-muted-foreground"
            }`}
          />
          <h4 className="text-[13px] font-extrabold">
            {checklist.isComplete
              ? "Ready for Ambak"
              : "Ready for Ambak — missing items"}
          </h4>
        </div>
        {!checklist.isComplete && (
          <ul className="grid gap-1 text-[12.5px] text-muted-foreground sm:grid-cols-2">
            {checklist.missing.map((m) => (
              <li key={m} className="before:mr-1.5 before:content-['·']">
                {m}
              </li>
            ))}
          </ul>
        )}
        {checklist.isComplete && (
          <p className="text-[12.5px] text-[#15803d]">
            Checklist complete. Re-confirm consent and set Ambak lead id below.
          </p>
        )}
      </section>

      <ApplicationSteps
        app={app}
        onPatchApp={(p) => patchApplication(referral.id, p)}
        onPatchApplicant={(id, p) => patchApplicant(referral.id, id, p)}
        onAddCo={() => {
          addCoApplicant(referral.id);
          showToast("Co-applicant added");
        }}
        onRemoveCo={(id) => {
          removeCoApplicant(referral.id, id);
          showToast("Co-applicant removed");
        }}
        onBlur={onBlur}
      />

      <ConsentHandoff
        app={app}
        onReconfirm={() => {
          reconfirmConsent(referral.id);
          showToast("Consent re-confirmed");
        }}
        onAmbakId={(id) => {
          const res = setAmbakLeadId(referral.id, id);
          if (!res.ok) showToast(res.error);
        }}
        onDeskNotes={(notes) =>
          patchApplication(referral.id, { deskNotes: notes })
        }
        onBlur={onBlur}
      />

      {saathiOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/20"
            aria-label="Close sheet backdrop"
            onClick={() => setSaathiOpen(false)}
          />
          <SaathiSheetPanel
            app={app}
            onClose={() => setSaathiOpen(false)}
            onCopy={showToast}
          />
        </>
      )}
    </div>
  );
}
