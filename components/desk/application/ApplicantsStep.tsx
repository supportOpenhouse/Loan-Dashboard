"use client";

import {
  CITIES,
} from "@/lib/demo/constants";
import {
  INDIAN_STATES,
  QUALIFICATIONS,
  RELATIONSHIP_OPTIONS,
} from "@/lib/demo/application-constants";
import type { LoanApplicant } from "@/lib/demo/application-types";
import {
  Field,
  YesNoToggle,
  inputClass,
} from "./FormControls";

export function ApplicantsStep({
  applicant,
  onPatch,
  onBlur,
}: {
  applicant: LoanApplicant;
  onPatch: (p: Partial<LoanApplicant>) => void;
  onBlur: () => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {!applicant.isPrimary && (
        <Field label="Relationship to primary" required>
          <select
            className={inputClass}
            value={applicant.relationship}
            onChange={(e) =>
              onPatch({
                relationship: e.target.value as LoanApplicant["relationship"],
              })
            }
            onBlur={onBlur}
          >
            <option value="">Select</option>
            {RELATIONSHIP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="First name" required ambak={applicant.isPrimary}>
        <input
          className={inputClass}
          value={applicant.firstName}
          onChange={(e) => onPatch({ firstName: e.target.value })}
          onBlur={onBlur}
        />
      </Field>
      <Field
        label="Last name"
        required={applicant.isPrimary}
        ambak={applicant.isPrimary}
      >
        <input
          className={inputClass}
          value={applicant.lastName}
          onChange={(e) => onPatch({ lastName: e.target.value })}
          onBlur={onBlur}
        />
      </Field>

      <Field label="Mobile" required ambak={applicant.isPrimary}>
        <div className="flex overflow-hidden rounded-lg border border-border">
          <span className="flex items-center border-r border-border bg-muted px-2.5 text-[12px] font-semibold text-muted-foreground">
            +91
          </span>
          <input
            className="h-[34px] min-w-0 flex-1 px-2.5 font-mono text-[13px] outline-none"
            inputMode="numeric"
            maxLength={10}
            value={applicant.mobile}
            onChange={(e) =>
              onPatch({ mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })
            }
            onBlur={onBlur}
          />
        </div>
      </Field>

      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          value={applicant.email}
          onChange={(e) => onPatch({ email: e.target.value })}
          onBlur={onBlur}
        />
      </Field>

      <Field label="Date of birth" ambak={applicant.isPrimary}>
        <input
          className={inputClass}
          type="date"
          value={applicant.dob}
          onChange={(e) => onPatch({ dob: e.target.value })}
          onBlur={onBlur}
        />
      </Field>

      <Field label="Gender">
        <select
          className={inputClass}
          value={applicant.gender}
          onChange={(e) =>
            onPatch({ gender: e.target.value as LoanApplicant["gender"] })
          }
          onBlur={onBlur}
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <Field label="PAN" ambak={applicant.isPrimary}>
        <input
          className={`${inputClass} font-mono uppercase`}
          maxLength={10}
          value={applicant.pan}
          onChange={(e) =>
            onPatch({ pan: e.target.value.toUpperCase().slice(0, 10) })
          }
          onBlur={onBlur}
          placeholder="ABCDE1234F"
        />
      </Field>

      <Field label="Aadhaar (last 4)">
        <input
          className={`${inputClass} font-mono`}
          maxLength={4}
          inputMode="numeric"
          value={applicant.aadhaarLast4}
          onChange={(e) =>
            onPatch({
              aadhaarLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
            })
          }
          onBlur={onBlur}
        />
      </Field>

      <Field label="Marital status">
        <select
          className={inputClass}
          value={applicant.maritalStatus}
          onChange={(e) =>
            onPatch({
              maritalStatus: e.target
                .value as LoanApplicant["maritalStatus"],
            })
          }
          onBlur={onBlur}
        >
          <option value="">Select</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
        </select>
      </Field>

      <Field label="Mother's name">
        <input
          className={inputClass}
          value={applicant.mothersName}
          onChange={(e) => onPatch({ mothersName: e.target.value })}
          onBlur={onBlur}
        />
      </Field>

      <Field label="Highest qualification">
        <select
          className={inputClass}
          value={applicant.qualification}
          onChange={(e) => onPatch({ qualification: e.target.value })}
          onBlur={onBlur}
        >
          <option value="">Select</option>
          {QUALIFICATIONS.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </Field>

      <div className="section-label sm:col-span-2 lg:col-span-3 mt-2">
        Current address
      </div>

      <Field label="Pincode" ambak={applicant.isPrimary}>
        <input
          className={`${inputClass} font-mono`}
          maxLength={6}
          inputMode="numeric"
          value={applicant.addressPincode}
          onChange={(e) =>
            onPatch({
              addressPincode: e.target.value.replace(/\D/g, "").slice(0, 6),
            })
          }
          onBlur={onBlur}
        />
      </Field>

      <Field label="State">
        <select
          className={inputClass}
          value={applicant.addressState}
          onChange={(e) => onPatch({ addressState: e.target.value })}
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

      <Field label="City" ambak={applicant.isPrimary}>
        <select
          className={inputClass}
          value={applicant.addressCity}
          onChange={(e) => onPatch({ addressCity: e.target.value })}
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
          value={applicant.addressLine1}
          onChange={(e) => onPatch({ addressLine1: e.target.value })}
          onBlur={onBlur}
        />
      </Field>
      <Field label="Address line 2">
        <input
          className={inputClass}
          value={applicant.addressLine2}
          onChange={(e) => onPatch({ addressLine2: e.target.value })}
          onBlur={onBlur}
        />
      </Field>

      <Field label="Current address same as Aadhaar?">
        <YesNoToggle
          value={applicant.currentAddressSameAsAadhaar}
          onChange={(v) => onPatch({ currentAddressSameAsAadhaar: v })}
          onBlur={onBlur}
        />
      </Field>
    </div>
  );
}
