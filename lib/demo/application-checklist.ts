import { isSelfEmployed } from "./application-constants";
import type { ChecklistResult, LoanApplication } from "./application-types";

export function computeChecklist(app: LoanApplication): ChecklistResult {
  const missing: string[] = [];
  const primary = app.applicants.find((a) => a.isPrimary);

  if (!app.loanAmount) missing.push("Loan: loan amount");
  if (!app.tenureYears) missing.push("Loan: desired tenure");
  if (app.isBalanceTransfer) {
    if (!app.existingLender) missing.push("Loan: existing lender");
    if (!app.existingOutstanding)
      missing.push("Loan: existing outstanding");
  }

  if (!primary) {
    missing.push("Primary applicant: missing");
  } else {
    if (!primary.firstName.trim())
      missing.push("Primary applicant: first name");
    if (!primary.lastName.trim())
      missing.push("Primary applicant: last name");
    if (!/^[6-9]\d{9}$/.test(primary.mobile))
      missing.push("Primary applicant: mobile");
    if (!primary.dob) missing.push("Primary applicant: date of birth");
    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(primary.pan))
      missing.push("Primary applicant: PAN");
    if (!primary.employmentType)
      missing.push("Primary applicant: employment type");
    if (!primary.addressCity.trim())
      missing.push("Primary applicant: current city");
    if (!/^[1-9]\d{5}$/.test(primary.addressPincode))
      missing.push("Primary applicant: pincode");

    const emp = primary.employmentType;
    if (emp === "salaried") {
      if (!primary.takeHomeMonthly && !primary.grossMonthly) {
        missing.push(
          "Primary applicant income: take-home or gross monthly salary",
        );
      }
      if (!primary.organisationName.trim()) {
        missing.push("Primary applicant income: organisation name");
      }
    } else if (isSelfEmployed(emp)) {
      if (!primary.grossAnnualIncome) {
        missing.push("Primary applicant income: gross annual income");
      }
    } else if (emp === "not_employed") {
      const earningCo = app.applicants.some(
        (a) =>
          !a.isPrimary &&
          (a.employmentType === "salaried" ||
            isSelfEmployed(a.employmentType)) &&
          (a.takeHomeMonthly ||
            a.grossMonthly ||
            a.grossAnnualIncome),
      );
      if (!earningCo) {
        missing.push(
          "Primary applicant: add an earning co-applicant (not employed)",
        );
      }
    }
  }

  if (app.propertyIdentified) {
    if (!app.propertyMarketValue && !app.propertyAgreementValue) {
      missing.push("Property: market or agreement value");
    }
    if (!app.purchaseType) missing.push("Property: purchase type");
    if (!app.propertyType) missing.push("Property: property type");
    if (!app.propertyCity.trim()) missing.push("Property: city");
  }

  const docs = app.documents.filter((d) => !d.isDeleted && d.status !== "rejected");
  const primaryId = primary?.id;
  const hasDoc = (type: string) =>
    docs.some((d) => d.applicantId === primaryId && d.docType === type);

  if (primaryId) {
    if (!hasDoc("pan")) missing.push("Document: PAN card (primary)");
    if (!hasDoc("aadhaar")) missing.push("Document: Aadhaar card (primary)");
    if (primary?.employmentType === "salaried" && !hasDoc("salary_slips")) {
      missing.push("Document: salary slips (primary)");
    }
    if (primary && isSelfEmployed(primary.employmentType) && !hasDoc("itr")) {
      missing.push("Document: ITR (primary)");
    }
  }

  if (!app.consentReconfirmedAt) {
    missing.push("Consent re-confirmed");
  }

  return { isComplete: missing.length === 0, missing };
}
