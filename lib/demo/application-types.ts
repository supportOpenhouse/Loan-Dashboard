export type LoanType = "home_loan" | "loan_against_property";

export type ApplicantEmployment =
  | "salaried"
  | "self_employed_professional"
  | "self_employed_non_professional"
  | "retired"
  | "not_employed"
  | "";

export type Relationship =
  | "spouse"
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "brother"
  | "sister"
  | "business_partner"
  | "other"
  | "";

export type DocType =
  | "photo"
  | "pan"
  | "aadhaar"
  | "address_proof"
  | "rent_agreement"
  | "salary_slips"
  | "form16"
  | "salary_bank_statement"
  | "itr"
  | "business_proof"
  | "savings_bank_statement"
  | "property_agreement"
  | "property_chain_documents"
  | "other";

export type DocStatus = "uploaded" | "verified" | "rejected";

export interface LoanApplicant {
  id: number;
  isPrimary: boolean;
  sortOrder: number;
  relationship: Relationship;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  dob: string;
  gender: "" | "male" | "female" | "other";
  pan: string;
  aadhaarLast4: string;
  maritalStatus: "" | "single" | "married" | "divorced" | "widowed";
  mothersName: string;
  qualification: string;
  addressPincode: string;
  addressState: string;
  addressCity: string;
  addressLine1: string;
  addressLine2: string;
  currentAddressSameAsAadhaar: boolean | null;
  employmentType: ApplicantEmployment;
  takeHomeMonthly: number | null;
  grossMonthly: number | null;
  salaryCreditMode: string;
  organisationType: string;
  organisationName: string;
  careerStartYear: number | null;
  currentOrgSinceYear: number | null;
  form16Filed: boolean | null;
  grossAnnualIncome: number | null;
  businessType: string;
  yearsInBusiness: number | null;
  itrFiled: boolean | null;
  hasBusinessProof: boolean | null;
  additionalIncomeAnnual: number | null;
  additionalIncomeSource: string;
  hasEmiObligations: boolean | null;
  totalEmiMonthly: number | null;
}

export interface LoanDocument {
  id: number;
  applicantId: number | null;
  docType: DocType;
  label: string;
  originalName: string;
  bytes: number;
  fileFormat: string;
  status: DocStatus;
  rejectionNote: string;
  uploadedAt: string;
  isDeleted: boolean;
}

export interface LoanApplication {
  referralId: number;
  loanType: LoanType;
  loanAmount: number | null;
  tenureYears: number | null;
  isBalanceTransfer: boolean;
  isTopUp: boolean;
  existingLender: string;
  existingOutstanding: number | null;
  preferredLender: string;
  notesForPartner: string;
  propertyIdentified: boolean;
  propertyMarketValue: number | null;
  propertyAgreementValue: number | null;
  purchaseType: string;
  propertyType: string;
  propertyUsage: string;
  propertyRegistration: string;
  builderName: string;
  projectName: string;
  propertyPincode: string;
  propertyState: string;
  propertyCity: string;
  propertyAddressLine1: string;
  propertyAddressLine2: string;
  deskNotes: string;
  consentReconfirmedAt: string | null;
  consentReconfirmedBy: string | null;
  ambakLeadId: string;
  applicants: LoanApplicant[];
  documents: LoanDocument[];
  nextApplicantId: number;
  nextDocumentId: number;
  updatedAt: string;
}

export interface ChecklistResult {
  isComplete: boolean;
  missing: string[];
}

export interface SaathiField {
  label: string;
  value: string;
}

export interface SaathiSection {
  title: string;
  fields: SaathiField[];
}
