import type { LoanReferral } from "./types";
import type {
  ApplicantEmployment,
  LoanApplicant,
  LoanApplication,
} from "./application-types";
import { homeById } from "./constants";

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function mapEmployment(emp: LoanReferral["emp"]): ApplicantEmployment {
  if (emp === "salaried") return "salaried";
  if (emp === "self_employed") return "self_employed_non_professional";
  return "";
}

export function blankApplicant(
  id: number,
  opts: Partial<LoanApplicant> & { isPrimary: boolean; sortOrder: number },
): LoanApplicant {
  return {
    id,
    isPrimary: opts.isPrimary,
    sortOrder: opts.sortOrder,
    relationship: opts.relationship ?? "",
    firstName: opts.firstName ?? "",
    lastName: opts.lastName ?? "",
    mobile: opts.mobile ?? "",
    email: opts.email ?? "",
    dob: opts.dob ?? "",
    gender: opts.gender ?? "",
    pan: opts.pan ?? "",
    aadhaarLast4: opts.aadhaarLast4 ?? "",
    maritalStatus: opts.maritalStatus ?? "",
    mothersName: opts.mothersName ?? "",
    qualification: opts.qualification ?? "",
    addressPincode: opts.addressPincode ?? "",
    addressState: opts.addressState ?? "",
    addressCity: opts.addressCity ?? "",
    addressLine1: opts.addressLine1 ?? "",
    addressLine2: opts.addressLine2 ?? "",
    currentAddressSameAsAadhaar: opts.currentAddressSameAsAadhaar ?? null,
    employmentType: opts.employmentType ?? "",
    takeHomeMonthly: opts.takeHomeMonthly ?? null,
    grossMonthly: opts.grossMonthly ?? null,
    salaryCreditMode: opts.salaryCreditMode ?? "",
    organisationType: opts.organisationType ?? "",
    organisationName: opts.organisationName ?? "",
    careerStartYear: opts.careerStartYear ?? null,
    currentOrgSinceYear: opts.currentOrgSinceYear ?? null,
    form16Filed: opts.form16Filed ?? null,
    grossAnnualIncome: opts.grossAnnualIncome ?? null,
    businessType: opts.businessType ?? "",
    yearsInBusiness: opts.yearsInBusiness ?? null,
    itrFiled: opts.itrFiled ?? null,
    hasBusinessProof: opts.hasBusinessProof ?? null,
    additionalIncomeAnnual: opts.additionalIncomeAnnual ?? null,
    additionalIncomeSource: opts.additionalIncomeSource ?? "",
    hasEmiObligations: opts.hasEmiObligations ?? null,
    totalEmiMonthly: opts.totalEmiMonthly ?? null,
  };
}

export function createApplicationFromReferral(
  referral: LoanReferral,
  now: string,
): LoanApplication {
  const { firstName, lastName } = splitName(referral.client);
  const primary = blankApplicant(1, {
    isPrimary: true,
    sortOrder: 0,
    firstName,
    lastName,
    mobile: referral.mobile,
    pan: referral.pan || "",
    employmentType: mapEmployment(referral.emp),
  });

  let propertyCity = "";
  let projectName = "";
  let propertyMarketValue: number | null = null;
  if (referral.prop.kind === "openhouse" && referral.prop.homeId) {
    const h = homeById(referral.prop.homeId);
    if (h) {
      projectName = h.soc;
      propertyCity = h.city;
      propertyMarketValue = h.price;
    }
  } else {
    projectName = referral.prop.name || "";
    propertyCity = referral.prop.city || "";
  }

  return {
    referralId: referral.id,
    loanType: "home_loan",
    loanAmount: referral.amount,
    tenureYears: null,
    isBalanceTransfer: false,
    isTopUp: false,
    existingLender: "",
    existingOutstanding: null,
    preferredLender: "",
    notesForPartner: "",
    propertyIdentified: true,
    propertyMarketValue,
    propertyAgreementValue: null,
    purchaseType: referral.prop.kind === "openhouse" ? "Resale" : "",
    propertyType: referral.prop.kind === "openhouse" ? "Ready to move" : "",
    propertyUsage: referral.prop.kind === "openhouse" ? "Residential" : "",
    propertyRegistration: "",
    builderName: "",
    projectName,
    propertyPincode: "",
    propertyState:
      propertyCity === "Gurgaon"
        ? "Haryana"
        : propertyCity === "Delhi"
          ? "Delhi"
          : propertyCity
            ? "Uttar Pradesh"
            : "",
    propertyCity,
    propertyAddressLine1: "",
    propertyAddressLine2: "",
    deskNotes: "",
    consentReconfirmedAt: null,
    consentReconfirmedBy: null,
    ambakLeadId: "",
    applicants: [primary],
    documents: [],
    nextApplicantId: 2,
    nextDocumentId: 1,
    updatedAt: now,
  };
}

export function prefillPropertyFromListing(
  app: LoanApplication,
  referral: LoanReferral,
): LoanApplication {
  if (referral.prop.kind !== "openhouse" || !referral.prop.homeId) return app;
  const h = homeById(referral.prop.homeId);
  if (!h) return app;

  const fill = <T>(current: T, next: T): T =>
    current === "" || current === null || current === undefined ? next : current;

  return {
    ...app,
    projectName: fill(app.projectName, h.soc),
    builderName: fill(app.builderName, ""),
    propertyCity: fill(app.propertyCity, h.city),
    propertyState: fill(
      app.propertyState,
      h.city === "Gurgaon"
        ? "Haryana"
        : h.city === "Delhi"
          ? "Delhi"
          : "Uttar Pradesh",
    ),
    propertyMarketValue: fill(app.propertyMarketValue, h.price),
    purchaseType: fill(app.purchaseType, "Resale"),
    propertyType: fill(app.propertyType, "Ready to move"),
    propertyUsage: fill(app.propertyUsage, "Residential"),
  };
}
