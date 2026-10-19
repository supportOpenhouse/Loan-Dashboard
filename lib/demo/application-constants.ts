import type { DocType } from "./application-types";

export const AMBAK_LENDERS = [
  "ICICI Bank",
  "Kotak Mahindra Bank",
  "Aditya Birla Finance",
  "Bank of Baroda",
  "HDFC Bank",
  "Bajaj Housing Finance",
  "Central Bank of India",
  "Punjab National Bank",
  "Bank of India",
  "Bank of Maharashtra",
] as const;

export const INDIAN_STATES = [
  "Haryana",
  "Uttar Pradesh",
  "Delhi",
  "Punjab",
  "Rajasthan",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "West Bengal",
  "Madhya Pradesh",
  "Telangana",
  "Andhra Pradesh",
  "Kerala",
  "Bihar",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Goa",
  "Other",
];

export const RELATIONSHIP_OPTIONS: { value: string; label: string }[] = [
  { value: "spouse", label: "Spouse" },
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "brother", label: "Brother" },
  { value: "sister", label: "Sister" },
  { value: "business_partner", label: "Business partner" },
  { value: "other", label: "Other" },
];

export const EMPLOYMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "salaried", label: "Salaried" },
  { value: "self_employed_professional", label: "Self-employed professional" },
  {
    value: "self_employed_non_professional",
    label: "Self-employed non-professional",
  },
  { value: "retired", label: "Retired" },
  { value: "not_employed", label: "Not employed" },
];

export const PURCHASE_TYPES = [
  "Resale",
  "Builder purchase",
  "Authority allotment",
  "Self construction",
  "Other",
];

export const PROPERTY_TYPES = ["Ready to move", "Under construction"];
export const PROPERTY_USAGES = ["Residential", "Commercial"];
export const PROPERTY_REGISTRATIONS = [
  "Registered",
  "Agreement to sell",
  "Allotment letter",
  "Other",
];

export const QUALIFICATIONS = [
  "Post-graduate or higher",
  "Graduate",
  "Diploma",
  "Class 12",
  "Other",
];

export const ORGANISATION_TYPES = [
  "Private limited",
  "Public limited",
  "Government",
  "PSU",
  "MNC",
  "Partnership",
  "Proprietorship",
  "Other",
];

export const SALARY_CREDIT_MODES = ["Bank transfer", "Cheque", "Cash"];

export const ADDITIONAL_INCOME_SOURCES = [
  "Rent",
  "Interest",
  "Pension",
  "Agriculture",
  "Other",
];

export const DOC_SLOTS: {
  docType: DocType;
  label: string;
  scope: "applicant" | "property";
  when?: "always" | "salaried" | "self_employed" | "rent";
}[] = [
  { docType: "photo", label: "Passport-size photograph", scope: "applicant", when: "always" },
  { docType: "pan", label: "PAN card", scope: "applicant", when: "always" },
  { docType: "aadhaar", label: "Aadhaar card", scope: "applicant", when: "always" },
  { docType: "address_proof", label: "Current address proof", scope: "applicant", when: "always" },
  { docType: "rent_agreement", label: "Rent agreement", scope: "applicant", when: "rent" },
  { docType: "salary_slips", label: "Salary slips (last 6 months)", scope: "applicant", when: "salaried" },
  { docType: "form16", label: "Form 16 (last 2 years)", scope: "applicant", when: "salaried" },
  {
    docType: "salary_bank_statement",
    label: "Salary account statement (1 year)",
    scope: "applicant",
    when: "salaried",
  },
  { docType: "itr", label: "ITR (last 3 years)", scope: "applicant", when: "self_employed" },
  { docType: "business_proof", label: "Business proof", scope: "applicant", when: "self_employed" },
  {
    docType: "savings_bank_statement",
    label: "Savings account statement (1 year)",
    scope: "applicant",
    when: "always",
  },
  {
    docType: "property_agreement",
    label: "Agreement to sell / ATS",
    scope: "property",
    when: "always",
  },
  {
    docType: "property_chain_documents",
    label: "Property chain documents",
    scope: "property",
    when: "always",
  },
  { docType: "other", label: "Other", scope: "applicant", when: "always" },
];

export function isSelfEmployed(emp: string) {
  return (
    emp === "self_employed_professional" ||
    emp === "self_employed_non_professional"
  );
}
