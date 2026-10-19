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
import { computeChecklist } from "./application-checklist";
import {
  blankApplicant,
  createApplicationFromReferral,
  prefillPropertyFromListing,
} from "./application-seed";
import type {
  ChecklistResult,
  DocStatus,
  DocType,
  LoanApplicant,
  LoanApplication,
  LoanDocument,
} from "./application-types";
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
      if (parsed?.referrals?.length) {
        return {
          ...parsed,
          applications: parsed.applications ?? {},
        };
      }
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

function appKey(id: number) {
  return String(id);
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
  getOrCreateApplication: (referralId: number) => LoanApplication | null;
  patchApplication: (
    referralId: number,
    patch: Partial<LoanApplication>,
  ) => LoanApplication | null;
  patchApplicant: (
    referralId: number,
    applicantId: number,
    patch: Partial<LoanApplicant>,
  ) => LoanApplication | null;
  addCoApplicant: (referralId: number) => LoanApplication | null;
  removeCoApplicant: (
    referralId: number,
    applicantId: number,
  ) => LoanApplication | null;
  prefillFromListing: (referralId: number) => LoanApplication | null;
  addDocument: (
    referralId: number,
    input: {
      applicantId: number | null;
      docType: DocType;
      label: string;
      originalName: string;
      bytes: number;
      fileFormat: string;
    },
  ) => LoanDocument | null;
  patchDocument: (
    referralId: number,
    docId: number,
    patch: { status?: DocStatus; rejectionNote?: string },
  ) => void;
  deleteDocument: (referralId: number, docId: number) => void;
  reconfirmConsent: (referralId: number) => void;
  setAmbakLeadId: (
    referralId: number,
    ambakLeadId: string,
  ) => { ok: true } | { ok: false; error: string };
  getChecklist: (referralId: number) => ChecklistResult;
  toast: string | null;
  clearToast: () => void;
  showToast: (msg: string) => void;
  lastSavedAt: string | null;
}

const DemoContext = createContext<DemoContextValue | null>(null);

/** In-memory File blobs for View during the session */
export const documentFileMap = new Map<number, File>();

export function DemoProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<DeskUser | null>(null);
  const [state, setState] = useState<DemoState>(() => createSeedState());
  const [toast, setToast] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

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

  const markSaved = useCallback(() => {
    setLastSavedAt(new Date().toISOString());
  }, []);

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
    documentFileMap.clear();
    showToast("Demo data reset");
  }, [showToast]);

  const counts = useMemo(() => {
    const c = {
      submitted: 0,
      disbursed: 0,
      notConverted: 0,
      all: state.referrals.length,
    };
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

  const getOrCreateApplication = useCallback(
    (referralId: number): LoanApplication | null => {
      const key = appKey(referralId);
      const existing = state.applications[key];
      if (existing) return existing;
      const referral = state.referrals.find((r) => r.id === referralId);
      if (!referral) return null;
      const app = createApplicationFromReferral(referral, state.now);
      setState((prev) => ({
        ...prev,
        applications: { ...prev.applications, [key]: app },
      }));
      return app;
    },
    [state],
  );

  const updateApp = useCallback(
    (
      referralId: number,
      updater: (app: LoanApplication) => LoanApplication,
    ): LoanApplication | null => {
      const key = appKey(referralId);
      let result: LoanApplication | null = null;
      setState((prev) => {
        let app = prev.applications[key];
        if (!app) {
          const referral = prev.referrals.find((r) => r.id === referralId);
          if (!referral) return prev;
          app = createApplicationFromReferral(referral, prev.now);
        }
        result = { ...updater(app), updatedAt: prev.now };
        return {
          ...prev,
          applications: { ...prev.applications, [key]: result },
        };
      });
      markSaved();
      return result;
    },
    [markSaved],
  );

  const patchApplication = useCallback(
    (referralId: number, patch: Partial<LoanApplication>) => {
      const { applicants: _a, documents: _d, ...safe } = patch;
      return updateApp(referralId, (app) => ({ ...app, ...safe }));
    },
    [updateApp],
  );

  const patchApplicant = useCallback(
    (
      referralId: number,
      applicantId: number,
      patch: Partial<LoanApplicant>,
    ) => {
      return updateApp(referralId, (app) => ({
        ...app,
        applicants: app.applicants.map((a) =>
          a.id === applicantId ? { ...a, ...patch } : a,
        ),
      }));
    },
    [updateApp],
  );

  const addCoApplicant = useCallback(
    (referralId: number) => {
      return updateApp(referralId, (app) => {
        if (app.applicants.filter((a) => !a.isPrimary).length >= 5) return app;
        const id = app.nextApplicantId;
        const co = blankApplicant(id, {
          isPrimary: false,
          sortOrder: app.applicants.length,
          relationship: "spouse",
        });
        return {
          ...app,
          applicants: [...app.applicants, co],
          nextApplicantId: id + 1,
        };
      });
    },
    [updateApp],
  );

  const removeCoApplicant = useCallback(
    (referralId: number, applicantId: number) => {
      return updateApp(referralId, (app) => {
        const target = app.applicants.find((a) => a.id === applicantId);
        if (!target || target.isPrimary) return app;
        return {
          ...app,
          applicants: app.applicants.filter((a) => a.id !== applicantId),
          documents: app.documents.map((d) =>
            d.applicantId === applicantId ? { ...d, isDeleted: true } : d,
          ),
        };
      });
    },
    [updateApp],
  );

  const prefillFromListing = useCallback(
    (referralId: number) => {
      const referral = state.referrals.find((r) => r.id === referralId);
      if (!referral) return null;
      return updateApp(referralId, (app) =>
        prefillPropertyFromListing(app, referral),
      );
    },
    [state.referrals, updateApp],
  );

  const addDocument = useCallback(
    (
      referralId: number,
      input: {
        applicantId: number | null;
        docType: DocType;
        label: string;
        originalName: string;
        bytes: number;
        fileFormat: string;
      },
    ): LoanDocument | null => {
      let created: LoanDocument | null = null;
      updateApp(referralId, (app) => {
        const id = app.nextDocumentId;
        created = {
          id,
          applicantId: input.applicantId,
          docType: input.docType,
          label: input.label,
          originalName: input.originalName,
          bytes: input.bytes,
          fileFormat: input.fileFormat,
          status: "uploaded",
          rejectionNote: "",
          uploadedAt: state.now,
          isDeleted: false,
        };
        return {
          ...app,
          documents: [...app.documents, created!],
          nextDocumentId: id + 1,
        };
      });
      return created;
    },
    [state.now, updateApp],
  );

  const patchDocument = useCallback(
    (
      referralId: number,
      docId: number,
      patch: { status?: DocStatus; rejectionNote?: string },
    ) => {
      updateApp(referralId, (app) => ({
        ...app,
        documents: app.documents.map((d) =>
          d.id === docId ? { ...d, ...patch } : d,
        ),
      }));
    },
    [updateApp],
  );

  const deleteDocument = useCallback(
    (referralId: number, docId: number) => {
      documentFileMap.delete(docId);
      updateApp(referralId, (app) => ({
        ...app,
        documents: app.documents.map((d) =>
          d.id === docId ? { ...d, isDeleted: true } : d,
        ),
      }));
    },
    [updateApp],
  );

  const reconfirmConsent = useCallback(
    (referralId: number) => {
      if (!user) return;
      updateApp(referralId, (app) => ({
        ...app,
        consentReconfirmedAt: state.now,
        consentReconfirmedBy: user.name,
      }));
    },
    [state.now, updateApp, user],
  );

  const setAmbakLeadId = useCallback(
    (referralId: number, ambakLeadId: string) => {
      const trimmed = ambakLeadId.trim();
      if (!trimmed) {
        patchApplication(referralId, { ambakLeadId: "" });
        return { ok: true as const };
      }
      const taken = Object.values(state.applications).some(
        (a) =>
          a.referralId !== referralId &&
          a.ambakLeadId &&
          a.ambakLeadId === trimmed,
      );
      if (taken) return { ok: false as const, error: "Ambak lead id already used." };
      const app = state.applications[appKey(referralId)];
      if (!app?.consentReconfirmedAt) {
        return {
          ok: false as const,
          error: "Re-confirm consent before setting Ambak lead id.",
        };
      }
      patchApplication(referralId, { ambakLeadId: trimmed });
      return { ok: true as const };
    },
    [patchApplication, state.applications],
  );

  const getChecklist = useCallback(
    (referralId: number): ChecklistResult => {
      const app =
        state.applications[appKey(referralId)] ??
        (() => {
          const r = state.referrals.find((x) => x.id === referralId);
          return r ? createApplicationFromReferral(r, state.now) : null;
        })();
      if (!app) return { isComplete: false, missing: ["Application missing"] };
      return computeChecklist(app);
    },
    [state],
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
      if (input.prop.kind === "openhouse" && !input.prop.homeId) {
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
        source:
          input.referrerType === "desk" ? "dashboard_crm" : "dashboard_phone",
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

      const app = createApplicationFromReferral(referral, createdAt);

      setState((prev) => ({
        ...prev,
        referrals: [referral, ...prev.referrals],
        applications: {
          ...prev.applications,
          [appKey(referral.id)]: app,
        },
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
        remarks,
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
    getOrCreateApplication,
    patchApplication,
    patchApplicant,
    addCoApplicant,
    removeCoApplicant,
    prefillFromListing,
    addDocument,
    patchDocument,
    deleteDocument,
    reconfirmConsent,
    setAmbakLeadId,
    getChecklist,
    toast,
    clearToast,
    showToast,
    lastSavedAt,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
