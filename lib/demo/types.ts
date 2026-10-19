import type { LoanApplication } from "./application-types";

export type LoanStatus = "submitted" | "disbursed" | "not_converted";
export type DeskRole = "desk" | "admin";
export type ReferrerType = "broker" | "desk";
export type PropertyKind = "openhouse" | "other";
export type EmploymentType = "salaried" | "self_employed" | "";

export type NotConvertedReason =
  | "client_not_reachable"
  | "client_not_interested"
  | "took_loan_elsewhere"
  | "not_eligible"
  | "duplicate_referral"
  | "purchase_cancelled"
  | "other";

export type EntrySource =
  | "home_card"
  | "loans_home"
  | "property_detail"
  | "visit_completed"
  | "profile"
  | "dashboard_phone"
  | "dashboard_crm"
  | "other";

export interface DeskUser {
  id: string;
  email: string;
  name: string;
  role: DeskRole;
}

export interface Broker {
  id: number;
  name: string;
  company: string;
  phone: string;
  cp: string;
  city: string;
}

export interface Home {
  id: number;
  soc: string;
  bhk: string;
  loc: string;
  city: string;
  price: number;
  code: string;
}

export interface PropertyRef {
  kind: PropertyKind;
  homeId?: number;
  name?: string;
  city?: string;
}

export interface StatusEvent {
  at: string;
  from: LoanStatus | null;
  to: LoanStatus;
  reason: NotConvertedReason | null;
  remarks: string | null;
  source: "broker" | "desk";
  actor: string;
  pushed: boolean;
}

export interface LoanReferral {
  id: number;
  ref: string;
  brokerId: number | null;
  referrerType: ReferrerType;
  client: string;
  mobile: string;
  pan: string;
  emp: EmploymentType;
  amount: number | null;
  prop: PropertyRef;
  note: string;
  source: EntrySource;
  createdAt: string;
  status: LoanStatus;
  reason: NotConvertedReason | null;
  remarks: string | null;
  setAt: string | null;
  setBy: string | null;
  events: StatusEvent[];
  createdByDesk: boolean;
  pct: number;
}

export interface DemoState {
  referrals: LoanReferral[];
  applications: Record<string, LoanApplication>;
  nextId: number;
  refSeed: number;
  now: string;
}

export interface SessionState {
  userId: string;
}

export type TabKey = LoanStatus | "all";

export interface CreateLeadInput {
  referrerType: ReferrerType;
  brokerId: number | null;
  clientName: string;
  clientMobile: string;
  prop: PropertyRef;
  amount: number | null;
  consent: boolean;
}

export interface FinalStatusInput {
  status: "disbursed" | "not_converted" | "submitted";
  reason?: NotConvertedReason;
  remarks: string;
}

export interface CreateLeadResult {
  ok: true;
  referral: LoanReferral;
}

export interface CreateLeadError {
  ok: false;
  error: string;
  existing?: { id: number; ref: string; brokerName: string; status: LoanStatus };
}

export interface SetFinalResult {
  ok: true;
  referral: LoanReferral;
  message: string;
}

export interface SetFinalError {
  ok: false;
  error: string;
}
