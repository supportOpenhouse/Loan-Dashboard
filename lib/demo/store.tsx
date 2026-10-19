"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  brokerById,
  DEMO_START,
  deskUserById,
  DUP_WINDOW_DAYS,
  SESSION_KEY,
  STORAGE_KEY,
} from "./constants";
import { cleanMobile, propertyTitle } from "./format";
import { createSeedState } from "./seed";
import type {
  CreateLeadError,
  CreateLeadInput,
  CreateLeadResult,
  DemoState,
  DeskUser,
  FinalStatusInput,
  LoanReferral,
  SetFinalError,
  SetFinalResult,
  TabKey,
} from "./types";

function loadState(): DemoState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.referrals?.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return createSeedState();
}

function saveState(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function loadSession(): DeskUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw) as { userId: string };
    return deskUserById(userId) ?? null;
  } catch {
    return null;
  }
}

function genRef(seed: number): { ref: string; nextSeed: number } {
  let s = seed;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += A[Math.floor(rnd() * A.length)];
  return { ref: `OHL-${out}`, nextSeed: s };
}

function findDuplicate(
  referrals: LoanReferral[],
  mobile: string,
  pan: string | null,
  now: string,
): LoanReferral | undefined {
  const lim = +new Date(now) - DUP_WINDOW_DAYS * 864e5;
  return referrals.find(
    (r) =>
      r.status === "submitted" &&
      +new Date(r.createdAt) >= lim &&
      (r.mobile === mobile || (pan && r.pan && r.pan === pan)),
  );
}

interface DemoContextValue {
  ready: boolean;
  user: DeskUser | null;
  state: DemoState;
  login: (userId: string) => void;
  logout: () => void;
  resetDemo: () => void;
  counts: { submitted: number; disbursed: number; notConverted: number; all: number };
  filterReferrals: (tab: TabKey, q: string) => LoanReferral[];
  getReferral: (id: number) => LoanReferral | undefined;
  createLead: (input: CreateLeadInput) => CreateLeadResult | CreateLeadError;
  setFinalStatus: (
    id: number,
    input: FinalStatusInput,
  ) => SetFinalResult | SetFinalError;
  toast: string | null;
  clearToast: () => void;
  showToast: (msg: string) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<DeskUser | null>(null);
  const [state, setState] = useState<DemoState>(() => createSeedState());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setState(loadState());
    setUser(loadSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const login = useCallback((userId: string) => {
    const u = deskUserById(userId);
    if (!u) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const resetDemo = useCallback(() => {
    const next = createSeedState();
    setState(next);
    saveState(next);
    showToast("Demo data reset");
  }, [showToast]);

  const counts = useMemo(() => {
    const c = { submitted: 0, disbursed: 0, notConverted: 0, all: state.referrals.length };
    for (const r of state.referrals) {
      if (r.status === "submitted") c.submitted++;
      else if (r.status === "disbursed") c.disbursed++;
      else c.notConverted++;
    }
    return c;
  }, [state.referrals]);

  const filterReferrals = useCallback(
    (tab: TabKey, q: string) => {
      const query = q.trim().toLowerCase();
      let rows = state.referrals;
      if (tab !== "all") rows = rows.filter((r) => r.status === tab);
      if (!query) return rows;
      return state.referrals.filter((r) => {
        const b = r.brokerId ? brokerById(r.brokerId) : null;
        const hay = [
          r.ref,
          r.client,
          r.mobile,
          b?.name,
          b?.phone,
          propertyTitle(r.prop),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
    },
    [state.referrals],
  );

  const getReferral = useCallback(
    (id: number) => state.referrals.find((r) => r.id === id),
    [state.referrals],
  );

  const createLead = useCallback(
    (input: CreateLeadInput): CreateLeadResult | CreateLeadError => {
      if (!user) return { ok: false, error: "Sign in required." };
      const name = input.clientName.trim();
      const mobile = cleanMobile(input.clientMobile);
      if (name.length < 2) return { ok: false, error: "Enter the client name." };
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        return { ok: false, error: "Enter a valid 10-digit mobile number." };
      }
      if (!input.consent) {
        return { ok: false, error: "Confirm the client agreed to be contacted." };
      }
      if (input.referrerType === "broker" && !input.brokerId) {
        return { ok: false, error: "Choose a broker." };
      }
      if (
        input.prop.kind === "openhouse" && !input.prop.homeId
      ) {
        return { ok: false, error: "Choose the Openhouse property." };
      }
      if (
        input.prop.kind === "other" &&
        (!input.prop.name || input.prop.name.trim().length < 2)
      ) {
        return { ok: false, error: "Enter the society or project name." };
      }

      const dup = findDuplicate(state.referrals, mobile, null, state.now);
      if (dup) {
        const b = dup.brokerId ? brokerById(dup.brokerId) : null;
        return {
          ok: false,
          error: `Already referred: ${dup.ref} · ${dup.client} (${b?.name || "own buyer"}) · ${dup.status === "submitted" ? "With loan desk" : dup.status}.`,
          existing: {
            id: dup.id,
            ref: dup.ref,
            brokerName: b?.name || "Own buyer",
            status: dup.status,
          },
        };
      }

      const { ref, nextSeed } = genRef(state.refSeed);
      const createdAt = state.now || DEMO_START;
      const referral: LoanReferral = {
        id: state.nextId + 1,
        ref,
        brokerId: input.referrerType === "broker" ? input.brokerId : null,
        referrerType: input.referrerType,
        client: name,
        mobile,
        pan: "",
        emp: "",
        amount: input.amount,
        prop: input.prop,
        note: "",
        source: input.referrerType === "desk" ? "dashboard_crm" : "dashboard_phone",
        createdAt,
        status: "submitted",
        reason: null,
        remarks: null,
        setAt: null,
        setBy: null,
        events: [
          {
            at: createdAt,
            from: null,
            to: "submitted",
            reason: null,
            remarks: null,
            source: "desk",
            actor: user.name,
            pushed: false,
          },
        ],
        createdByDesk: true,
        pct: 0.5,
      };

      setState((prev) => ({
        ...prev,
        referrals: [referral, ...prev.referrals],
        nextId: prev.nextId + 1,
        refSeed: nextSeed,
      }));

      return { ok: true, referral };
    },
    [state, user],
  );

  const setFinalStatus = useCallback(
    (id: number, input: FinalStatusInput): SetFinalResult | SetFinalError => {
      if (!user) return { ok: false, error: "Sign in required." };
      const remarks = input.remarks.trim();
      if (remarks.length < 5 || remarks.length > 500) {
        return { ok: false, error: "Remarks must be 5–500 characters." };
      }
      if (input.status === "not_converted" && !input.reason) {
        return { ok: false, error: "Choose a reason." };
      }

      const current = state.referrals.find((r) => r.id === id);
      if (!current) return { ok: false, error: "Lead not found." };

      const isReopen = input.status === "submitted";
      const isFirstFinal = current.status === "submitted" && !isReopen;
      const isChange =
        current.status !== "submitted" &&
        !isReopen &&
        (input.status === "disbursed" || input.status === "not_converted");

      if ((isChange || isReopen) && user.role !== "admin") {
        return { ok: false, error: "Only an admin can change a final status." };
      }

      if (
        !isReopen &&
        current.status === input.status &&
        current.remarks === remarks &&
        (input.status !== "not_converted" || current.reason === input.reason)
      ) {
        return { ok: false, error: "Nothing changed." };
      }

      const at = state.now || DEMO_START;
      const from = current.status;
      const nextStatus = input.status;
      const pushed =
        !isReopen && nextStatus !== "submitted" && !!current.brokerId;
      const reason =
        nextStatus === "not_converted" ? input.reason ?? null : null;

      let message = "Saved.";
      if (pushed) {
        const b = brokerById(current.brokerId!);
        message = `Saved. ${b?.name || "Broker"} was notified.`;
      } else if (isReopen) {
        message = "Lead reopened.";
      }

      const updated: LoanReferral = {
        ...current,
        status: nextStatus,
        reason,
        remarks: isReopen ? remarks : remarks,
        setAt: isReopen ? null : at,
        setBy: isReopen ? null : user.name,
        events: [
          ...current.events,
          {
            at,
            from,
            to: nextStatus,
            reason,
            remarks,
            source: "desk",
            actor: user.name,
            pushed,
          },
        ],
      };

      setState((prev) => ({
        ...prev,
        referrals: prev.referrals.map((r) => (r.id === id ? updated : r)),
      }));

      return { ok: true, referral: updated, message };
    },
    [state, user],
  );

  const value: DemoContextValue = {
    ready,
    user,
    state,
    login,
    logout,
    resetDemo,
    counts,
    filterReferrals,
    getReferral,
    createLead,
    setFinalStatus,
    toast,
    clearToast,
    showToast,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
