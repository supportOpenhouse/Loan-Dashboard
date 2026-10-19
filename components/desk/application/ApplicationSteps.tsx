"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { LoanApplicant, LoanApplication } from "@/lib/demo/application-types";
import { ApplicantsStep } from "./ApplicantsStep";
import { IncomeStep } from "./IncomeStep";
import { LoanStep } from "./LoanStep";
import { PropertyStep } from "./PropertyStep";

const STEPS = [
  { id: "loan", label: "Loan" },
  { id: "applicants", label: "Applicants" },
  { id: "income", label: "Income" },
  { id: "property", label: "Property" },
] as const;

export function ApplicationSteps({
  app,
  onPatchApp,
  onPatchApplicant,
  onAddCo,
  onRemoveCo,
  onBlur,
}: {
  app: LoanApplication;
  onPatchApp: (p: Partial<LoanApplication>) => void;
  onPatchApplicant: (
    applicantId: number,
    p: Partial<LoanApplicant>,
  ) => void;
  onAddCo: () => void;
  onRemoveCo: (applicantId: number) => void;
  onBlur: () => void;
}) {
  const [step, setStep] = useState(0);
  const [activeApplicantId, setActiveApplicantId] = useState(
    () => app.applicants.find((a) => a.isPrimary)?.id ?? app.applicants[0]?.id,
  );
  const [prevCount, setPrevCount] = useState(app.applicants.length);

  const sorted = [...app.applicants].sort((a, b) => a.sortOrder - b.sortOrder);
  const active =
    sorted.find((a) => a.id === activeApplicantId) ?? sorted[0];

  useEffect(() => {
    if (app.applicants.length > prevCount) {
      const newest = [...app.applicants].sort(
        (a, b) => b.sortOrder - a.sortOrder,
      )[0];
      if (newest) setActiveApplicantId(newest.id);
    } else if (
      activeApplicantId != null &&
      !app.applicants.some((a) => a.id === activeApplicantId)
    ) {
      const primary = app.applicants.find((a) => a.isPrimary);
      if (primary) setActiveApplicantId(primary.id);
    }
    setPrevCount(app.applicants.length);
  }, [app.applicants, activeApplicantId, prevCount]);

  const showApplicantTabs = step === 1 || step === 2;
  const coCount = sorted.filter((a) => !a.isPrimary).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[12px] font-bold",
              step === i
                ? "border-foreground bg-foreground text-white"
                : "border-border bg-white",
            )}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {showApplicantTabs && active && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {sorted.map((a) => {
            const label = a.isPrimary
              ? "Primary"
              : a.firstName
                ? a.firstName
                : `Co-applicant`;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setActiveApplicantId(a.id)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[12px] font-bold",
                  a.id === active.id
                    ? "border-primary bg-[#fff4ed] text-primary"
                    : "border-border bg-white",
                )}
              >
                {label}
                {!a.isPrimary && a.relationship ? ` · ${a.relationship}` : ""}
              </button>
            );
          })}
          {coCount < 5 && (
            <button
              type="button"
              onClick={() => {
                onAddCo();
              }}
              className="rounded-lg border border-dashed border-border px-2.5 py-1 text-[12px] font-bold text-muted-foreground"
            >
              + Co-applicant
            </button>
          )}
          {active && !active.isPrimary && (
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Remove this co-applicant and their documents?",
                  )
                ) {
                  const next = sorted.find(
                    (a) => a.id !== active.id && a.isPrimary,
                  );
                  onRemoveCo(active.id);
                  if (next) setActiveApplicantId(next.id);
                }
              }}
              className="ml-auto rounded-lg border border-[#f3b4b4] px-2.5 py-1 text-[12px] font-bold text-[#c62828]"
            >
              Remove
            </button>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-3.5">
        {step === 0 && (
          <LoanStep app={app} onPatch={onPatchApp} onBlur={onBlur} />
        )}
        {step === 1 && active && (
          <ApplicantsStep
            applicant={active}
            onPatch={(p) => onPatchApplicant(active.id, p)}
            onBlur={onBlur}
          />
        )}
        {step === 2 && active && (
          <IncomeStep
            applicant={active}
            onPatch={(p) => onPatchApplicant(active.id, p)}
            onBlur={onBlur}
          />
        )}
        {step === 3 && (
          <PropertyStep app={app} onPatch={onPatchApp} onBlur={onBlur} />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="h-[34px] rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold disabled:opacity-40"
        >
          Back
        </button>
        <span className="text-[11.5px] text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
        <button
          type="button"
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          className="h-[34px] rounded-[9px] border border-foreground bg-foreground px-3 text-[12.5px] font-bold text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
