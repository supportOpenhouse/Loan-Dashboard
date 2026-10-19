# Openhouse Loans — loan desk application form (Loans Dashboard)

**For:** the Loans Dashboard developer and the backend developer
**Who fills it:** the Openhouse loan desk (Adiksha now; the loan RM later). They fill it during or after the call with the client, so everything is collected in one go.
**Where:** a new **Application** tab on the lead page (`B2`) of the Loans Dashboard. The broker app does not change.
**Why this order:** it follows Ambak's Saathi portal screen by screen (Loan → Customer → Income → Property), so the desk can copy it into Saathi field by field.

It also adds what our old Demand Dashboard loan form collected that Saathi doesn't: documents, career years, the address-vs-Aadhaar check, and co-applicant relationship.

Sources:
- Saathi screenshots shared on 15 Oct (Add New Lead, Loan / Customer / Income (salaried and self-employed) / Property steps);
- the existing `OH Loan Form` in `supportOpenhouse/Demand-Dashboard` (`public/loan-form.html`, 14 Sep);
- the 15 Oct Ankit–Akshit call.

---

## 1. Layout

```
┌ Lead header: OHL-XXXXXX · client · mobile · status · "Broker sees: …" ────────────────────────┐
│ Tabs:  Lead  |  Application  |  Documents  |  Final status                                     │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Ready for Ambak? ✓/✗ checklist (2 columns) ]   [ Saathi sheet ] [ Send client link ] [Prefill]│
│                                                                                               │
│ Steps:  1 Loan  ·  2 Applicants  ·  3 Income  ·  4 Property                                   │
│ Applicant tabs (steps 2–3):  Primary · Rahul  |  Co-applicant 1 · Neha  |  + Co-applicant      │
│ ┌ 3-column field grid ─────────────────────────────────────────────────────────────────────┐ │
│ │ …fields for the current step…                                                          │ │
│ └────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                            "Saved 11:42 am"   [ Back ]  [ Next step → ]      │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Autosave** on blur of each field (`PATCH`). Show "Saved hh:mm am" and an inline error if a save fails. There is no Submit button: the form is never "submitted", it becomes **Ready for Ambak** when the checklist (§8) is green.
- Each step can be filled in any order. **Next step** only moves; it doesn't validate. The checklist shows what's missing.
- Amount fields show a live lakh/crore helper under the input (`7000000` → "₹70L", `12000000` → "₹1.2 Cr").
- The PAN input is upper-case, monospace, with `maxLength 10`. All dates use a date picker and store `YYYY-MM-DD`.
- `*` below marks **required to save that record**. ✅ marks **required for "Ready for Ambak"**. Everything else is optional.

---

## 2. Step 1 · Loan (one per lead)

Saathi screen: **Loan Details**

| Field | Control | Save `*` / Ambak ✅ | Validation | Shown when | DB column (`loans_loanapplication`) | API key | Saathi field |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Loan type | Radio: Home loan / Loan against property | `*` (default Home loan) | — | always | `loan_type` (`home_loan` / `loan_against_property`) | `loanType` | Home Loan / Loan Against Property |
| Loan amount (₹) | Number + lakh helper | ✅ | 1,00,000 – 50,00,00,000; integer | always | `loan_amount` | `loanAmount` | Loan Amount* |
| Desired tenure (years) | Dropdown 1–30 | ✅ | 1–30 | always | `tenure_years` | `tenureYears` | Desired Tenure* |
| Balance transfer | Checkbox | — | — | always | `is_balance_transfer` | `isBalanceTransfer` | Balance Transfer |
| Top-up | Checkbox | — | — | always | `is_top_up` | `isTopUp` | Top-Up |
| Existing lender | Dropdown of banks/HFCs + Other | ✅ when BT ticked | — | Balance transfer ticked | `existing_lender` | `existingLender` | — (tell Ambak) |
| Existing outstanding (₹) | Number + lakh helper | ✅ when BT ticked | > 0 | Balance transfer ticked | `existing_outstanding` | `existingOutstanding` | — |
| Preferred lender | Dropdown (Ambak's 10 lenders) + "No preference" | — | — | always | `preferred_lender` | `preferredLender` | — |
| Notes for Ambak | Textarea, 500 | — | ≤ 500 | always | `notes_for_partner` | `notesForPartner` | — (pasted into Saathi remarks) |

Pre-filled from the referral: `loanAmount` = `loanAmountRequested`.

Ambak's 10 lenders, from their 14 Oct mail:
- ICICI Bank, Kotak Mahindra Bank, Aditya Birla Finance, Bank of Baroda, HDFC Bank;
- Bajaj Housing Finance, Central Bank of India, Punjab National Bank, Bank of India, Bank of Maharashtra.

---

## 3. Step 2 · Applicants (primary + up to 5 co-applicants)

Saathi screen: **Customer Details**, with "+ Add a Co-Applicant" (same fields).

Each applicant is one row in `loans_loanapplicant`. The primary is created automatically from the referral: name split on the first space, mobile, PAN, and employment mapped from the broker's choice.

| Field | Control | Save `*` / Ambak ✅ | Validation | Shown when | DB column (`loans_loanapplicant`) | API key | Saathi field |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Relationship to primary | Dropdown: Spouse, Father, Mother, Son, Daughter, Brother, Sister, Business partner, Other | `*` for co-applicants | — | co-applicants only | `relationship` | `relationship` | — |
| First name | Text | `*` | 1–60; letters, spaces, `.'-` | always | `first_name` | `firstName` | First Name* |
| Last name | Text | `*` primary · ✅ | 1–60; same | always | `last_name` | `lastName` | Last Name* |
| Mobile | `+91` + 10 digits | `*` primary · ✅ | `^[6-9]\d{9}$` | always | `mobile` | `mobile` | Mobile Number* |
| Email | Email | — | valid email | always | `email` | `email` | Email ID |
| Date of birth | Date picker | ✅ primary | in the past; age ≥ 18 today | always | `dob` | `dob` | DOB |
| Gender | Dropdown: Male, Female, Other | — | — | always | `gender` | `gender` | Gender |
| PAN | Text, upper-case | ✅ primary | `^[A-Z]{5}[0-9]{4}[A-Z]$`; not already on another applicant of this lead | always | `pan` | `pan` | PAN No. |
| Aadhaar (last 4 digits) | 4-digit text | — | `^\d{4}$` | always | `aadhaar_last4` | `aadhaarLast4` | Aadhar Number (see note) |
| Marital status | Dropdown: Single, Married, Divorced, Widowed | — | — | always | `marital_status` | `maritalStatus` | Marital Status |
| Mother's name | Text | — | 1–100 | always | `mothers_name` | `mothersName` | Mother's Name |
| Highest qualification | Dropdown: Post-graduate or higher, Graduate, Diploma, Class 12, Other | — | — | always | `qualification` | `qualification` | Qualification |
| **Current address** (sub-heading) | | | | | | | |
| Pincode | 6 digits | ✅ primary | `^[1-9]\d{5}$` | always | `address_pincode` | `addressPincode` | Pin Code |
| State | Dropdown of Indian states (Haryana, Uttar Pradesh, Delhi first) | — | — | always | `address_state` | `addressState` | State |
| City | Dropdown from `oh.City` + "Other" → text | ✅ primary | — | always | `address_city` | `addressCity` | City |
| Address line 1 | Text | — | ≤ 200 | always | `address_line1` | `addressLine1` | Address Line1 |
| Address line 2 | Text | — | ≤ 200 | always | `address_line2` | `addressLine2` | Address Line2 |
| Current address same as Aadhaar? | Yes / No toggle | — | — | always | `current_address_same_as_aadhaar` (null = not asked) | `currentAddressSameAsAadhaar` | — (decides the rent agreement, §6) |

**Aadhaar:** we **never store the full Aadhaar number**, only the last 4 digits. If Saathi needs the full number, the desk reads it from the uploaded Aadhaar card and types it into Saathi directly.

Buttons in this step:
- **+ Co-applicant**, up to 5;
- **Remove co-applicant**, with a confirm; not available on the primary.
- Removing a co-applicant also soft-deletes their documents.

---

## 4. Step 3 · Income (per applicant; fields switch on employment type)

Saathi screen: **Income Details**. Saathi shows different fields for salaried and self-employed applicants; both screenshots are covered below.

### 4.1 Always shown

| Field | Control | Save `*` / Ambak ✅ | Validation | DB column (`loans_loanapplicant`) | API key | Saathi field |
| --- | --- | --- | --- | --- | --- | --- |
| Employment type | Dropdown: Salaried · Self-employed professional · Self-employed non-professional · Retired · Not employed | ✅ primary | — | `employment_type` | `employmentType` | Employment type |

### 4.2 Salaried (`employment_type = salaried`)

| Field | Control | Ambak ✅ | Validation | DB column | API key | Saathi field |
| --- | --- | --- | --- | --- | --- | --- |
| Take-home monthly salary (₹) | Number + helper | ✅ primary (this **or** gross) | > 0; ≤ gross if gross given | `take_home_monthly` | `takeHomeMonthly` | Take Home Monthly Salary |
| Gross monthly salary (₹) | Number + helper | ✅ primary (this **or** take-home) | > 0 | `gross_monthly` | `grossMonthly` | Gross Monthly Salary |
| Salary credit mode | Dropdown: Bank transfer, Cheque, Cash | — | — | `salary_credit_mode` | `salaryCreditMode` | Salary Credit Mode |
| Organisation type | Dropdown: Private limited, Public limited, Government, PSU, MNC, Partnership, Proprietorship, Other | — | — | `organisation_type` | `organisationType` | Organisation type |
| Organisation name | Text | ✅ primary | ≤ 150 | `organisation_name` | `organisationName` | Organisation Name |
| Career started (year) | Number | — | 1950 – current year | `career_start_year` | `careerStartYear` | — |
| In current organisation since (year) | Number | — | ≥ career start; ≤ current year | `current_org_since_year` | `currentOrgSinceYear` | — |
| Form 16 filed? | No / Yes toggle | — | — | `form16_filed` | `form16Filed` | Have you filed Form 16? |

### 4.3 Self-employed (professional or non-professional)

| Field | Control | Ambak ✅ | Validation | DB column | API key | Saathi field |
| --- | --- | --- | --- | --- | --- | --- |
| Gross annual income (₹) | Number + helper | ✅ primary | > 0 | `gross_annual_income` | `grossAnnualIncome` | Gross Annual Income |
| Profession / business type | Text, e.g. "Doctor", "Garment trading" | — | ≤ 100 | `business_type` | `businessType` | — |
| Years in business | Number | — | 0–60 | `years_in_business` | `yearsInBusiness` | — |
| ITR filed? | No / Yes toggle | — | — | `itr_filed` | `itrFiled` | Have you filed ITR? |
| Business proof available? | No / Yes toggle | — | — | `has_business_proof` | `hasBusinessProof` | Do you have business proof? |

### 4.4 Retired / Not employed

No income fields of their own. Additional income (§4.5) is how pension, rent or interest is recorded. A **Not employed** primary applicant shows an amber note: "Add an earning co-applicant. Lenders need an income."

### 4.5 Every employment type, below the type-specific fields

| Field | Control | Validation | Shown when | DB column | API key | Saathi field |
| --- | --- | --- | --- | --- | --- | --- |
| Additional income (₹/year) | Number + helper | ≥ 0 | always | `additional_income_annual` | `additionalIncomeAnnual` | + Additional Income |
| Additional income source | Dropdown: Rent, Interest, Pension, Agriculture, Other | — | additional income > 0 | `additional_income_source` | `additionalIncomeSource` | — |
| Any EMI / monthly obligations? | No / Yes toggle | — | always | `has_emi_obligations` | `hasEmiObligations` | Does the customer have any EMI based obligations / monthly obligations |
| Total EMI (₹/month) | Number + helper | **required** when the toggle is Yes; > 0 | toggle = Yes | `total_emi_monthly` | `totalEmiMonthly` | — |

---

## 5. Step 4 · Property (one per lead)

Saathi screen: **Property Details**

**Prefill from listing** button (shown only when the lead's property is an Openhouse listing):
- it fills `projectName` (society), `builderName`, `city`, `state`, `marketValue` (listing price);
- it sets `purchaseType = Resale`, `propertyType = Ready to move` and `usage = Residential`;
- it never overwrites a field the desk already filled.

| Field | Control | Ambak ✅ | Validation | Shown when | DB column (`loans_loanapplication`) | API key | Saathi field |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Property identified? | No / Yes toggle (default Yes) | — | — | always | `property_identified` | `propertyIdentified` | Property Identified? |
| Property market value (₹) | Number + helper | ✅ (this **or** agreement value) | > 0 | identified = Yes | `property_market_value` | `propertyMarketValue` | Property Market Value |
| Property agreement value (₹) | Number + helper | ✅ (this **or** market value) | > 0 | identified = Yes | `property_agreement_value` | `propertyAgreementValue` | Property Agreement Value |
| Purchase type | Dropdown: Resale · Builder purchase · Authority allotment · Self construction · Other | ✅ | — | identified = Yes | `purchase_type` | `purchaseType` | Purchase Type |
| Property type | Dropdown: Ready to move · Under construction | ✅ | — | identified = Yes | `property_type` | `propertyType` | Property Type |
| Property usage | Dropdown: Residential · Commercial | — | — | identified = Yes | `property_usage` | `propertyUsage` | Property Usage |
| Property registration | Dropdown (values from Saathi, to confirm) | — | — | identified = Yes | `property_registration` | `propertyRegistration` | Property Registration |
| Builder name | Text with suggestions | — | ≤ 120 | identified = Yes | `builder_name` | `builderName` | Builder Name |
| Project / society name | Text with suggestions | — | ≤ 150 | identified = Yes | `project_name` | `projectName` | Project Name |
| Pincode | 6 digits | — | `^[1-9]\d{5}$` | identified = Yes | `property_pincode` | `propertyPincode` | Pin Code |
| State | Dropdown | — | — | identified = Yes | `property_state` | `propertyState` | State |
| City | Dropdown + Other | ✅ | — | identified = Yes | `property_city` | `propertyCity` | City |
| Address line 1 / 2 | Text | — | ≤ 200 each | identified = Yes | `property_address_line1` / `_line2` | `propertyAddressLine1` / `…Line2` | Address Line 1 / 2 |

**Soft warning** (it doesn't block): loan amount > agreement value shows "Loan is more than the agreement value. Check with the client."

---

## 6. Documents (the Documents tab; one grid per applicant + one for the property)

From the existing OH Loan Form, plus property documents. Files go **straight from the browser to private (authenticated) Cloudinary storage**. Our server only signs the upload and records it. There are no public links; "View" opens a signed URL that expires in 10 minutes.

**Allowed files:** PDF, JPG, PNG, HEIC, WEBP, up to **10 MB** each, with several files per slot (e.g. 6 salary slips). Status per file: Uploaded → **Verified** / **Rejected** (with a note, e.g. "Blurred, ask again").

| Document (`doc_type`) | Per | Shown when | Ambak ✅ (primary) |
| --- | --- | --- | --- |
| Passport-size photograph (`photo`) | applicant | always | — |
| PAN card (`pan`) | applicant | always | ✅ |
| Aadhaar card (`aadhaar`) | applicant | always | ✅ |
| Current address proof (`address_proof`) | applicant | always | — |
| Rent agreement (`rent_agreement`) | applicant | "Current address same as Aadhaar?" = No | — |
| Salary slips, last 6 months (`salary_slips`) | applicant | Salaried | ✅ if salaried |
| Form 16, last 2 years, Part A & B (`form16`) | applicant | Salaried | — |
| Salary account statement, 1 year (`salary_bank_statement`) | applicant | Salaried | — |
| ITR, last 3 years (`itr`) | applicant | Self-employed (also allowed for salaried) | ✅ if self-employed |
| Business proof (`business_proof`) | applicant | Self-employed | — |
| Savings account statement, 1 year (`savings_bank_statement`) | applicant | always | — |
| Agreement to sell / ATS (`property_agreement`) | property | always | — |
| Property chain documents (`property_chain_documents`) | property | always | — |
| Other (`other`), with a free label | either | always | — |

DB table `loans_loandocument`:
- `referral`, `applicant` (null for property), `doc_type`, `label`;
- `cloudinary_public_id`, `resource_type`, `file_format`, `bytes`, `original_name`;
- `uploaded_via` (`desk` / `client_link`), `uploaded_by`;
- `status`, `reviewed_by`, `reviewed_at`, `rejection_note`, `is_deleted`.

---

## 7. Consent and hand-off (bottom of the Application tab)

| Field | Control | Rule | DB column | API key |
| --- | --- | --- | --- | --- |
| Client re-confirmed consent on the call | Checkbox | Must be ticked before entering an Ambak lead id. Stores who and when | `consent_reconfirmed_at`, `consent_reconfirmed_by` (on `loans_loanreferral`) | `consentReconfirmed` |
| Ambak lead id | Text, e.g. `AMB-55231` | Unique across leads; entered after the desk creates the lead in Saathi | `ambak_lead_id` (on `loans_loanreferral`) | `ambakLeadId` |
| Desk notes (internal) | Textarea | Never shown to the broker or the client | `desk_notes` (on `loans_loanapplication`) | `deskNotes` |

**Never on this form or in anything copied to Ambak:** the broker's name, phone or CP code.

---

## 8. "Ready for Ambak" checklist (computed by the server on every save)

The checklist turns green when all of these are present.

- **Loan:**
  - loan amount;
  - desired tenure;
  - existing lender + outstanding, if balance transfer.
- **Primary applicant:**
  - first name, last name, mobile, date of birth, PAN;
  - employment type;
  - current city and pincode.
- **Primary applicant income:**
  - salaried: take-home or gross monthly salary, plus organisation name;
  - self-employed: gross annual income;
  - not employed: at least one co-applicant with an income.
- **Property**, when identified:
  - market or agreement value;
  - purchase type, property type, city.
- **Documents for the primary applicant**, not rejected:
  - PAN card and Aadhaar card;
  - salaried: salary slips; self-employed: ITR.
- Consent re-confirmed.

The response returns `isComplete` and `missing[]`, e.g. `["Primary applicant: date of birth", "Document: PAN card (primary)"]`. The UI lists `missing[]` in two columns.

---

## 9. Saathi sheet (copy helper)

A side panel that lists every filled field **in Saathi's order and with Saathi's labels**, each with a **Copy** button:
1. **Loan Details:** Loan Amount, Desired Tenure, Loan Type, Balance Transfer, Top-Up.
2. **Customer Details:** one block per applicant. First Name, Last Name, Mobile Number, DOB, Gender, PAN No., Email ID, Marital Status, Mother's Name, Qualification, Pin Code, State, City, Address Line1, Address Line2.
3. **Income Details:** one block per applicant. Employment type, then the salaried or self-employed fields from §4, then additional income and obligations.
4. **Property Details:** Property Identified, Market Value, Agreement Value, Pin Code, State, City, Purchase Type, Property Type, Property Usage, Property Registration, Builder Name, Project Name, Address Line 1, Address Line 2.

Amounts are copied as plain digits with Indian grouping (`70,00,000`). A unit test asserts **no broker field ever appears** in the sheet.

---

## 10. API (core, under `/api/v1/oh/loans/desk/`; auth `X-Loans-Dashboard-Key` + `X-Loans-Actor`)

| Method + path | Does |
| --- | --- |
| `GET referrals/{id}/application/` | Returns the whole form (creates it on first call, pre-filled from the referral) + `isComplete` + `missing[]` |
| `PATCH referrals/{id}/application/` | Saves any loan or property fields (autosave) |
| `POST referrals/{id}/application/applicants/` | Adds a co-applicant (max 5) |
| `PATCH referrals/{id}/application/applicants/{applicantId}/` | Saves applicant and income fields |
| `DELETE referrals/{id}/application/applicants/{applicantId}/` | Removes a co-applicant (not the primary) |
| `POST referrals/{id}/application/prefill-from-listing/` | Openhouse properties only; fills empty fields only |
| `GET referrals/{id}/application/saathi-sheet/` | The §9 sheet as `{ sections: [{ title, fields: [{ label, value }] }] }` |
| `POST referrals/{id}/documents/sign/` | Returns signed upload params (`type: authenticated`, folder `loans/<reference>/`) |
| `POST referrals/{id}/documents/` | Records an uploaded file |
| `GET referrals/{id}/documents/{docId}/view/` | Returns a signed URL valid for 10 min |
| `PATCH referrals/{id}/documents/{docId}/` | `{ status: verified \| rejected, rejectionNote }` |
| `DELETE referrals/{id}/documents/{docId}/` | Soft delete |
| `POST referrals/{id}/consent-reconfirmed/` | Stamps who and when |
| `PATCH referrals/{id}/` `{ ambakLeadId }` | Saves the Ambak lead id. `409 ambak_lead_id_taken` if it's already used |

Conventions:
- Keys are camelCase on the wire; core's `djangorestframework_camel_case` converts them.
- Money is integer rupees.
- Errors are `{ detail, code, fields }`, with `fields` keyed by the API key so the UI puts each message under the right input.

---

## 11. Database (new tables in the `loans` app, alongside V1's 5)

| Table | One per | Key columns (full list in the field tables above) |
| --- | --- | --- |
| `loans_loanapplication` | lead (`OneToOne` → `loans_loanreferral`) | loan fields (§2), property fields (§5), `desk_notes`, `is_complete`, `completed_at`, `updated_by` |
| `loans_loanapplicant` | applicant (FK → application; exactly one `is_primary=true`) | `sort_order`, `relationship`, identity + address fields (§3), income fields (§4) |
| `loans_loandocument` | file (FK → referral; optional FK → applicant) | see §6 |

Column types:
- **Amounts:** `Decimal(14,2)`, sent as integers.
- **Years:** `PositiveSmallInteger`.
- **Toggles:** `Boolean null` (null = not asked).
- **Dropdowns:** `CharField` with choices, using the snake_case values of the labels above.

Add two columns to `loans_loanreferral`: `consent_reconfirmed_at` (DateTime null) and `consent_reconfirmed_by` (FK → desk user, null). `ambak_lead_id` (Char 64, unique when set) is also new on that table.

Every save writes `updated_by` and `updated_at`. Changes to PAN, mobile or loan amount also write a line to the lead's activity log ("Loan amount 65L → 70L by Adiksha").

---

## 12. Permissions

| Role | Application + documents | Saathi sheet | Ambak lead id |
| --- | --- | --- | --- |
| desk | edit | ✓ | set |
| admin | edit | ✓ | set / change |

The form stays editable after a final status is set, for corrections. Every edit is logged.

---

## 13. To confirm with Ambak before go-live

1. Exact dropdown values in Saathi for **Employment type**, **Purchase type**, **Property type**, **Property registration**, **Organisation type**, **Qualification** and **Salary credit mode**. The lists above are our best match from the screenshots and the old form.
2. Whether Saathi needs the **full Aadhaar number**. We store only the last 4, and the desk can type the full number from the document.
3. Which **documents** Ambak needs at login versus later, so the checklist can be tightened.
4. Whether a balance-transfer case needs more than the existing lender and outstanding amount.
