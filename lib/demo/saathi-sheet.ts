import { EMPLOYMENT_OPTIONS, isSelfEmployed } from "./application-constants";
import type {
  LoanApplicant,
  LoanApplication,
  SaathiSection,
} from "./application-types";

function money(n: number | null | undefined): string {
  if (n == null || !n) return "";
  return Math.round(n).toLocaleString("en-IN");
}

function empLabel(v: string) {
  return EMPLOYMENT_OPTIONS.find((o) => o.value === v)?.label || v;
}

function applicantBlock(a: LoanApplicant, title: string): SaathiSection {
  const income: { label: string; value: string }[] = [
    { label: "Employment type", value: empLabel(a.employmentType) },
  ];

  if (a.employmentType === "salaried") {
    income.push(
      { label: "Take Home Monthly Salary", value: money(a.takeHomeMonthly) },
      { label: "Gross Monthly Salary", value: money(a.grossMonthly) },
      { label: "Salary Credit Mode", value: a.salaryCreditMode },
      { label: "Organisation type", value: a.organisationType },
      { label: "Organisation Name", value: a.organisationName },
      {
        label: "Have you filed Form 16?",
        value:
          a.form16Filed == null ? "" : a.form16Filed ? "Yes" : "No",
      },
    );
  } else if (isSelfEmployed(a.employmentType)) {
    income.push(
      { label: "Gross Annual Income", value: money(a.grossAnnualIncome) },
      { label: "Profession / business type", value: a.businessType },
      {
        label: "Years in business",
        value: a.yearsInBusiness != null ? String(a.yearsInBusiness) : "",
      },
      {
        label: "Have you filed ITR?",
        value: a.itrFiled == null ? "" : a.itrFiled ? "Yes" : "No",
      },
      {
        label: "Do you have business proof?",
        value:
          a.hasBusinessProof == null
            ? ""
            : a.hasBusinessProof
              ? "Yes"
              : "No",
      },
    );
  }

  income.push(
    {
      label: "+ Additional Income",
      value: money(a.additionalIncomeAnnual),
    },
    {
      label: "Additional income source",
      value: a.additionalIncomeSource,
    },
    {
      label:
        "Does the customer have any EMI based obligations / monthly obligations",
      value:
        a.hasEmiObligations == null
          ? ""
          : a.hasEmiObligations
            ? "Yes"
            : "No",
    },
    { label: "Total EMI (₹/month)", value: money(a.totalEmiMonthly) },
  );

  return {
    title,
    fields: [
      { label: "First Name", value: a.firstName },
      { label: "Last Name", value: a.lastName },
      { label: "Mobile Number", value: a.mobile },
      { label: "DOB", value: a.dob },
      { label: "Gender", value: a.gender },
      { label: "PAN No.", value: a.pan },
      { label: "Email ID", value: a.email },
      { label: "Marital Status", value: a.maritalStatus },
      { label: "Mother's Name", value: a.mothersName },
      { label: "Qualification", value: a.qualification },
      { label: "Pin Code", value: a.addressPincode },
      { label: "State", value: a.addressState },
      { label: "City", value: a.addressCity },
      { label: "Address Line1", value: a.addressLine1 },
      { label: "Address Line2", value: a.addressLine2 },
      ...income,
    ].filter((f) => f.value),
  };
}

/** Builds Saathi copy sheet. Must never include broker fields. */
export function buildSaathiSheet(app: LoanApplication): SaathiSection[] {
  const sections: SaathiSection[] = [
    {
      title: "Loan Details",
      fields: [
        { label: "Loan Amount", value: money(app.loanAmount) },
        {
          label: "Desired Tenure",
          value: app.tenureYears != null ? String(app.tenureYears) : "",
        },
        {
          label: "Loan Type",
          value:
            app.loanType === "loan_against_property"
              ? "Loan Against Property"
              : "Home Loan",
        },
        {
          label: "Balance Transfer",
          value: app.isBalanceTransfer ? "Yes" : "No",
        },
        { label: "Top-Up", value: app.isTopUp ? "Yes" : "No" },
      ].filter((f) => f.value),
    },
  ];

  for (const a of [...app.applicants].sort((x, y) => x.sortOrder - y.sortOrder)) {
    const name = a.isPrimary
      ? "Customer Details · Primary"
      : `Customer Details · Co-applicant · ${a.firstName || "Untitled"}`;
    sections.push(applicantBlock(a, name));
  }

  sections.push({
    title: "Property Details",
    fields: [
      {
        label: "Property Identified",
        value: app.propertyIdentified ? "Yes" : "No",
      },
      { label: "Market Value", value: money(app.propertyMarketValue) },
      { label: "Agreement Value", value: money(app.propertyAgreementValue) },
      { label: "Pin Code", value: app.propertyPincode },
      { label: "State", value: app.propertyState },
      { label: "City", value: app.propertyCity },
      { label: "Purchase Type", value: app.purchaseType },
      { label: "Property Type", value: app.propertyType },
      { label: "Property Usage", value: app.propertyUsage },
      { label: "Property Registration", value: app.propertyRegistration },
      { label: "Builder Name", value: app.builderName },
      { label: "Project Name", value: app.projectName },
      { label: "Address Line 1", value: app.propertyAddressLine1 },
      { label: "Address Line 2", value: app.propertyAddressLine2 },
    ].filter((f) => f.value),
  });

  // Safety: strip any accidental broker keys
  const banned = /broker|cp\s*code|channel partner/i;
  return sections.map((s) => ({
    ...s,
    fields: s.fields.filter((f) => !banned.test(f.label)),
  }));
}
