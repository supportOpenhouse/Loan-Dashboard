"use client";

import {
  INDIAN_STATES,
  PROPERTY_REGISTRATIONS,
  PROPERTY_TYPES,
  PROPERTY_USAGES,
  PURCHASE_TYPES,
} from "@/lib/demo/application-constants";
import { CITIES } from "@/lib/demo/constants";
import type { LoanApplication } from "@/lib/demo/application-types";
import {
  Field,
  MoneyInput,
  YesNoToggle,
  inputClass,
} from "./FormControls";

export function PropertyStep({
  app,
  onPatch,
  onBlur,
}: {
  app: LoanApplication;
  onPatch: (p: Partial<LoanApplication>) => void;
  onBlur: () => void;
}) {
  const over =
    app.loanAmount &&
    app.propertyAgreementValue &&
    app.loanAmount > app.propertyAgreementValue;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Property identified?">
        <YesNoToggle
          value={app.propertyIdentified}
          onChange={(v) => onPatch({ propertyIdentified: v })}
          onBlur={onBlur}
        />
      </Field>

      {app.propertyIdentified && (
        <>
          <Field label="Property market value (₹)" ambak>
            <MoneyInput
              value={app.propertyMarketValue}
              onChange={(n) => onPatch({ propertyMarketValue: n })}
              onBlur={onBlur}
            />
          </Field>
          <Field label="Property agreement value (₹)" ambak>
            <MoneyInput
              value={app.propertyAgreementValue}
              onChange={(n) => onPatch({ propertyAgreementValue: n })}
              onBlur={onBlur}
            />
          </Field>

          {over && (
            <div className="rounded-[9px] border border-[#fde7b0] bg-[#fff8e6] px-3 py-2 text-[12.5px] text-[#7a4a00] sm:col-span-2 lg:col-span-3">
              Loan is more than the agreement value. Check with the client.
            </div>
          )}

          <Field label="Purchase type" ambak>
            <select
              className={inputClass}
              value={app.purchaseType}
              onChange={(e) => onPatch({ purchaseType: e.target.value })}
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {PURCHASE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Property type" ambak>
            <select
              className={inputClass}
              value={app.propertyType}
              onChange={(e) => onPatch({ propertyType: e.target.value })}
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Property usage">
            <select
              className={inputClass}
              value={app.propertyUsage}
              onChange={(e) => onPatch({ propertyUsage: e.target.value })}
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {PROPERTY_USAGES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Property registration">
            <select
              className={inputClass}
              value={app.propertyRegistration}
              onChange={(e) =>
                onPatch({ propertyRegistration: e.target.value })
              }
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {PROPERTY_REGISTRATIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Builder name">
            <input
              className={inputClass}
              value={app.builderName}
              onChange={(e) => onPatch({ builderName: e.target.value })}
              onBlur={onBlur}
            />
          </Field>
          <Field label="Project / society name">
            <input
              className={inputClass}
              value={app.projectName}
              onChange={(e) => onPatch({ projectName: e.target.value })}
              onBlur={onBlur}
            />
          </Field>

          <Field label="Pincode">
            <input
              className={`${inputClass} font-mono`}
              maxLength={6}
              inputMode="numeric"
              value={app.propertyPincode}
              onChange={(e) =>
                onPatch({
                  propertyPincode: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6),
                })
              }
              onBlur={onBlur}
            />
          </Field>

          <Field label="State">
            <select
              className={inputClass}
              value={app.propertyState}
              onChange={(e) => onPatch({ propertyState: e.target.value })}
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="City" ambak>
            <select
              className={inputClass}
              value={app.propertyCity}
              onChange={(e) => onPatch({ propertyCity: e.target.value })}
              onBlur={onBlur}
            >
              <option value="">Select</option>
              {CITIES.map(([, n]) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </Field>

          <Field label="Address line 1" className="sm:col-span-2">
            <input
              className={inputClass}
              value={app.propertyAddressLine1}
              onChange={(e) =>
                onPatch({ propertyAddressLine1: e.target.value })
              }
              onBlur={onBlur}
            />
          </Field>
          <Field label="Address line 2">
            <input
              className={inputClass}
              value={app.propertyAddressLine2}
              onChange={(e) =>
                onPatch({ propertyAddressLine2: e.target.value })
              }
              onBlur={onBlur}
            />
          </Field>
        </>
      )}
    </div>
  );
}
