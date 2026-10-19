"use client";

import {
  ADDITIONAL_INCOME_SOURCES,
  EMPLOYMENT_OPTIONS,
  ORGANISATION_TYPES,
  SALARY_CREDIT_MODES,
  isSelfEmployed,
} from "@/lib/demo/application-constants";
import type { LoanApplicant } from "@/lib/demo/application-types";
import {
  Field,
  MoneyInput,
  YesNoToggle,
  inputClass,
} from "./FormControls";

export function IncomeStep({
  applicant,
  onPatch,
  onBlur,
}: {
  applicant: LoanApplicant;
  onPatch: (p: Partial<LoanApplicant>) => void;
  onBlur: () => void;
}) {
  const emp = applicant.employmentType;
  const yearNow = new Date().getFullYear();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Employment type" ambak={applicant.isPrimary}>
        <select
          className={inputClass}
          value={emp}
          onChange={(e) =>
            onPatch({
              employmentType: e.target
                .value as LoanApplicant["employmentType"],
            })
          }
          onBlur={onBlur}
        >
          <option value="">Select</option>
          {EMPLOYMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      {emp === "not_employed" && applicant.isPrimary && (
        <div className="rounded-[9px] border border-[#fde7b0] bg-[#fff8e6] px-3 py-2 text-[12.5px] text-[#7a4a00] sm:col-span-2 lg:col-span-3">
          Add an earning co-applicant. Lenders need an income.
        </div>
      )}

      {emp === "salaried" && (
        <>
          <Field label="Take-home monthly salary (₹)" ambak={applicant.isPrimary}>
            <MoneyInput
              value={applicant.takeHomeMonthly}
              onChange={(n) => onPatch({ takeHomeMonthly: n })}
              onBlur={onBlur}
            />
          </Field>
          <Field label="Gross monthly salary (₹)" ambak={applicant.isPrimary}>
            <MoneyInput
              value={applicant.grossMonthly}
              onChange={(n) => onPatch({ grossMonthly: n })}
              onBlur={onBlur}
            />
          </Field>
          <Field label="Salary credit mode">
            <select
              className={inputClass}
              value={applicant.salaryCreditMode}
              onChange={(e) => onPatch({ salaryCreditMode: e.target.value })}
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {SALARY_CREDIT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Organisation type">
            <select
              className={inputClass}
              value={applicant.organisationType}
              onChange={(e) => onPatch({ organisationType: e.target.value })}
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {ORGANISATION_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Organisation name" ambak={applicant.isPrimary}>
            <input
              className={inputClass}
              value={applicant.organisationName}
              onChange={(e) => onPatch({ organisationName: e.target.value })}
              onBlur={onBlur}
            />
          </Field>
          <Field label="Career started (year)">
            <input
              className={inputClass}
              inputMode="numeric"
              value={applicant.careerStartYear ?? ""}
              onChange={(e) =>
                onPatch({
                  careerStartYear: e.target.value
                    ? +e.target.value.replace(/\D/g, "").slice(0, 4)
                    : null,
                })
              }
              onBlur={onBlur}
              placeholder={`1950–${yearNow}`}
            />
          </Field>
          <Field label="In current organisation since (year)">
            <input
              className={inputClass}
              inputMode="numeric"
              value={applicant.currentOrgSinceYear ?? ""}
              onChange={(e) =>
                onPatch({
                  currentOrgSinceYear: e.target.value
                    ? +e.target.value.replace(/\D/g, "").slice(0, 4)
                    : null,
                })
              }
              onBlur={onBlur}
            />
          </Field>
          <Field label="Form 16 filed?">
            <YesNoToggle
              value={applicant.form16Filed}
              onChange={(v) => onPatch({ form16Filed: v })}
              onBlur={onBlur}
            />
          </Field>
        </>
      )}

      {isSelfEmployed(emp) && (
        <>
          <Field label="Gross annual income (₹)" ambak={applicant.isPrimary}>
            <MoneyInput
              value={applicant.grossAnnualIncome}
              onChange={(n) => onPatch({ grossAnnualIncome: n })}
              onBlur={onBlur}
            />
          </Field>
          <Field label="Profession / business type">
            <input
              className={inputClass}
              value={applicant.businessType}
              onChange={(e) => onPatch({ businessType: e.target.value })}
              onBlur={onBlur}
              placeholder='e.g. "Doctor"'
            />
          </Field>
          <Field label="Years in business">
            <input
              className={inputClass}
              inputMode="numeric"
              value={applicant.yearsInBusiness ?? ""}
              onChange={(e) =>
                onPatch({
                  yearsInBusiness: e.target.value
                    ? +e.target.value.replace(/\D/g, "")
                    : null,
                })
              }
              onBlur={onBlur}
            />
          </Field>
          <Field label="ITR filed?">
            <YesNoToggle
              value={applicant.itrFiled}
              onChange={(v) => onPatch({ itrFiled: v })}
              onBlur={onBlur}
            />
          </Field>
          <Field label="Business proof available?">
            <YesNoToggle
              value={applicant.hasBusinessProof}
              onChange={(v) => onPatch({ hasBusinessProof: v })}
              onBlur={onBlur}
            />
          </Field>
        </>
      )}

      {emp !== "" && (
        <>
          <div className="section-label sm:col-span-2 lg:col-span-3 mt-2">
            Additional income & obligations
          </div>
          <Field label="Additional income (₹/year)">
            <MoneyInput
              value={applicant.additionalIncomeAnnual}
              onChange={(n) => onPatch({ additionalIncomeAnnual: n })}
              onBlur={onBlur}
            />
          </Field>
          {(applicant.additionalIncomeAnnual ?? 0) > 0 && (
            <Field label="Additional income source">
              <select
                className={inputClass}
                value={applicant.additionalIncomeSource}
                onChange={(e) =>
                  onPatch({ additionalIncomeSource: e.target.value })
                }
                onBlur={onBlur}
              >
                <option value="">Select</option>
                {ADDITIONAL_INCOME_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Any EMI / monthly obligations?">
            <YesNoToggle
              value={applicant.hasEmiObligations}
              onChange={(v) => onPatch({ hasEmiObligations: v })}
              onBlur={onBlur}
            />
          </Field>
          {applicant.hasEmiObligations && (
            <Field label="Total EMI (₹/month)" required>
              <MoneyInput
                value={applicant.totalEmiMonthly}
                onChange={(n) => onPatch({ totalEmiMonthly: n })}
                onBlur={onBlur}
              />
            </Field>
          )}
        </>
      )}
    </div>
  );
}
