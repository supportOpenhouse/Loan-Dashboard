# Openhouse Loans Desk · V1 (demo)

Responsive web dashboard for the Openhouse loan desk. Matches the V1 lead-collection spec: list leads, key in phone/CRM leads, copy client details for Ambak, and set a final status (Disbursed / Not converted) with remarks.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo login

Pick a seeded desk user on `/login`:

| User   | Role  | Can change final status |
|--------|-------|-------------------------|
| Adiksha | desk  | First final only        |
| Akshit  | admin | Change / reopen         |
| Ankit   | admin | Change / reopen         |

Session and lead mutations persist in `localStorage`. Use **Reset demo** in the account menu to restore the prototype seed (12 leads, demo clock 20 Dec 2026 11:00 IST).

## Scope

- **In V1:** leads tabs, search, lead detail, Copy for Ambak, New lead dialog, final status + admin change/reopen.
- **Out of V1:** live core API, real Google OAuth, calls, documents, Ambak API, payouts.

Design tokens follow `V1_lead_collection/prototype/index.html` (desk palette, `#FA541C` primary, status pills).
