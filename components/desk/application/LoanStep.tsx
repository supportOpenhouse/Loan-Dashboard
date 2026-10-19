"use client";

import {
  AMBAK_LENDERS,
} from "@/lib/demo/application-constants";
import type { LoanApplication } from "@/lib/demo/application-types";
import {
  ChoiceButtons,
  Field,
  MoneyInput,
  inputClass,
  textareaClass,
} from "./FormControls";

export function LoanStep({
  app,
  onPatch,
  onBlur,
}: {
  app: LoanApplication;
  onPatch: (p: Partial<LoanApplication>) => void;
  onBlur: () => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Loan type" required className="sm:col-span-2 lg:col-span-3">
        <ChoiceButtons
          value={app.loanType}
          onChange={(v) => {
            onPatch({ loanType: v as LoanApplication["loanType"] });
            onBlur();
          }}
          options={[
            { value: "home_loan", label: "Home loan" },
            { value: "loan_against_property", label: "Loan against property" },
          ]}
        />
      </Field>

      <Field label="Loan amount (₹)" ambak>
        <MoneyInput
          value={app.loanAmount}
          onChange={(n) => onPatch({ loanAmount: n })}
          onBlur={onBlur}
        />
      </Field>

      <Field label="Desired tenure (years)" ambak>
        <select
          className={inputClass}
          value={app.tenureYears ?? ""}
          onChange={(e) =>
            onPatch({
              tenureYears: e.target.value ? +e.target.value : null,
            })
          }
          onBlur={onBlur}
        >
          <option value="">Select</option>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Preferred lender">
        <select
          className={inputClass}
          value={app.preferredLender}
          onChange={(e) => onPatch({ preferredLender: e.target.value })}
          onBlur={onBlur}
        >
          <option value="">No preference</option>
          {AMBAK_LENDERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-3">
        <label className="flex items-center gap-2 text-[13px] font-semibold">
          <input
            type="checkbox"
            checked={app.isBalanceTransfer}
            onChange={(e) => {
              onPatch({ isBalanceTransfer: e.target.checked });
              onBlur();
            }}
            className="size-4 accent-primary"
          />
          Balance transfer
        </label>
        <label className="flex items-center gap-2 text-[13px] font-semibold">
          <input
            type="checkbox"
            checked={app.isTopUp}
            onChange={(e) => {
              onPatch({ isTopUp: e.target.checked });
              onBlur();
            }}
            className="size-4 accent-primary"
          />
          Top-up
        </label>
      </div>

      {app.isBalanceTransfer && (
        <>
          <Field label="Existing lender" ambak>
            <select
              className={inputClass}
              value={app.existingLender}
              onChange={(e) => onPatch({ existingLender: e.target.value })}
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {AMBAK_LENDERS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Existing outstanding (₹)" ambak>
            <MoneyInput
              value={app.existingOutstanding}
              onChange={(n) => onPatch({ existingOutstanding: n })}
              onBlur={onBlur}
            />
          </Field>
        </>
      )}

      <Field label="Notes for Ambak" className="sm:col-span-2 lg:col-span-3">
        <textarea
          className={textareaClass}
          rows={3}
          maxLength={500}
          value={app.notesForPartner}
          onChange={(e) => onPatch({ notesForPartner: e.target.value })}
          onBlur={onBlur}
          placeholder="Pasted into Saathi remarks"
        />
        <div className="mt-0.5 text-[11.5px] text-muted-foreground">
          {app.notesForPartner.length}/500
        </div>
      </Field>
    </div>
  );
}
