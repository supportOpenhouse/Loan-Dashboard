import type {
  Broker,
  DeskUser,
  Home,
  LoanStatus,
  NotConvertedReason,
} from "./types";

export const DEMO_START = "2026-12-20T11:00:00+05:30";
export const DUP_WINDOW_DAYS = 90;
export const STORAGE_KEY = "oh-loans-desk-demo-v1";
export const SESSION_KEY = "oh-loans-desk-session-v1";

export const STATUS_META: Record<
  LoanStatus,
  { label: string; pill: "submitted" | "disbursed" | "closed" }
> = {
  submitted: { label: "With loan desk", pill: "submitted" },
  disbursed: { label: "Disbursed", pill: "disbursed" },
  not_converted: { label: "Not converted", pill: "closed" },
};

export const REASONS: Record<NotConvertedReason, string> = {
  client_not_reachable: "Client not reachable",
  client_not_interested: "Client not interested",
  took_loan_elsewhere: "Took a loan elsewhere",
  not_eligible: "Not eligible with our lenders",
  duplicate_referral: "Duplicate referral",
  purchase_cancelled: "Purchase cancelled",
  other: "Other (see remarks)",
};

export const CITIES: [string, string][] = [
  ["1", "Gurgaon"],
  ["2", "Noida"],
  ["3", "Greater Noida"],
  ["4", "Ghaziabad"],
  ["5", "Delhi"],
  ["6", "Faridabad"],
];

export const HOMES: Home[] = [
  {
    id: 812,
    soc: "DLF The Crest",
    bhk: "3 BHK",
    loc: "Sector 54",
    city: "Gurgaon",
    price: 42000000,
    code: "OH-GGN-0812",
  },
  {
    id: 845,
    soc: "M3M Merlin",
    bhk: "3 BHK",
    loc: "Sector 67",
    city: "Gurgaon",
    price: 24500000,
    code: "OH-GGN-0845",
  },
  {
    id: 861,
    soc: "Godrej Meridien",
    bhk: "2 BHK",
    loc: "Sector 106",
    city: "Gurgaon",
    price: 19800000,
    code: "OH-GGN-0861",
  },
  {
    id: 877,
    soc: "Emaar Palm Gardens",
    bhk: "3 BHK",
    loc: "Sector 83",
    city: "Gurgaon",
    price: 17500000,
    code: "OH-GGN-0877",
  },
  {
    id: 903,
    soc: "ATS Pristine",
    bhk: "3 BHK",
    loc: "Sector 150",
    city: "Noida",
    price: 21000000,
    code: "OH-NDA-0903",
  },
  {
    id: 918,
    soc: "Mahagun Mezzaria",
    bhk: "4 BHK",
    loc: "Sector 78",
    city: "Noida",
    price: 38500000,
    code: "OH-NDA-0918",
  },
  {
    id: 931,
    soc: "Gaur City 2",
    bhk: "2 BHK",
    loc: "Gaur City",
    city: "Greater Noida",
    price: 9800000,
    code: "OH-GNO-0931",
  },
  {
    id: 946,
    soc: "Mahagun Mirabella",
    bhk: "3 BHK",
    loc: "Indirapuram",
    city: "Ghaziabad",
    price: 15500000,
    code: "OH-GZB-0946",
  },
];

export const BROKERS: Broker[] = [
  {
    id: 88,
    name: "Vikas Sharma",
    company: "Vikas Realty",
    phone: "9811042210",
    cp: "CP1042",
    city: "Gurgaon",
  },
  {
    id: 91,
    name: "Neha Gupta",
    company: "Homekey Realtors",
    phone: "9899123456",
    cp: "CP1187",
    city: "Gurgaon",
  },
  {
    id: 95,
    name: "Arjun Mehta",
    company: "Sector 54 Properties",
    phone: "9717654321",
    cp: "CP0931",
    city: "Gurgaon",
  },
];

export const DESK_USERS: DeskUser[] = [
  {
    id: "desk",
    email: "adiksha@openhouse.in",
    name: "Adiksha",
    role: "desk",
  },
  {
    id: "admin",
    email: "akshit@openhouse.in",
    name: "Akshit",
    role: "admin",
  },
  {
    id: "admin2",
    email: "ankit@openhouse.in",
    name: "Ankit",
    role: "admin",
  },
];

export const TABS: { key: "submitted" | "disbursed" | "not_converted" | "all"; label: string }[] =
  [
    { key: "submitted", label: "With loan desk" },
    { key: "disbursed", label: "Disbursed" },
    { key: "not_converted", label: "Not converted" },
    { key: "all", label: "All" },
  ];

export function homeById(id: number) {
  return HOMES.find((h) => h.id === id);
}

export function brokerById(id: number) {
  return BROKERS.find((b) => b.id === id);
}

export function deskUserById(id: string) {
  return DESK_USERS.find((u) => u.id === id);
}
