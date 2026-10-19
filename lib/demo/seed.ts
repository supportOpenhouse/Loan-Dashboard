import { DEMO_START } from "./constants";
import type {
  DemoState,
  EntrySource,
  LoanReferral,
  NotConvertedReason,
  PropertyRef,
  ReferrerType,
} from "./types";

function mulberry(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function genRef(rnd: () => number): string {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += A[Math.floor(rnd() * A.length)];
  return `OHL-${s}`;
}

type SeedInput = {
  brokerId: number | null;
  referrerType?: ReferrerType;
  client: string;
  mobile: string;
  pan?: string;
  emp?: "" | "salaried" | "self_employed";
  amount?: number | null;
  prop: PropertyRef;
  note?: string;
  source: EntrySource;
  createdAt: string;
  createdByDesk?: boolean;
};

type FinalTuple = [status: "disbursed" | "not_converted", at: string, reason: NotConvertedReason | null, remarks: string];

export function createSeedState(): DemoState {
  let nextId = 0;
  let refSeed = 20261016;
  const rnd = mulberry(refSeed);
  const referrals: LoanReferral[] = [];
  const now = DEMO_START;
  const offerPct = 0.5;

  const push = (o: SeedInput, fin?: FinalTuple) => {
    const id = ++nextId;
    const createdAt = o.createdAt.includes("+") ? o.createdAt : `${o.createdAt}:00+05:30`;
    const r: LoanReferral = {
      id,
      ref: genRef(rnd),
      brokerId: o.brokerId,
      referrerType: o.referrerType || (o.brokerId ? "broker" : "desk"),
      client: o.client,
      mobile: o.mobile,
      pan: o.pan || "",
      emp: o.emp || "",
      amount: o.amount ?? null,
      prop: o.prop,
      note: o.note || "",
      source: o.source,
      createdAt,
      status: "submitted",
      reason: null,
      remarks: null,
      setAt: null,
      setBy: null,
      events: [],
      createdByDesk: !!o.createdByDesk,
      pct: offerPct,
    };
    r.events.push({
      at: createdAt,
      from: null,
      to: "submitted",
      reason: null,
      remarks: null,
      source: r.createdByDesk || r.referrerType !== "broker" ? "desk" : "broker",
      actor: r.createdByDesk
        ? "Adiksha"
        : r.referrerType === "broker"
          ? o.brokerId === 88
            ? "Vikas Sharma"
            : o.brokerId === 91
              ? "Neha Gupta"
              : "Arjun Mehta"
          : "CRM",
      pushed: false,
    });

    if (fin) {
      const [status, atRaw, reason, remarks] = fin;
      const at = atRaw.includes("+") ? atRaw : `${atRaw}:00+05:30`;
      r.status = status;
      r.reason = status === "not_converted" ? reason : null;
      r.remarks = remarks;
      r.setAt = at;
      r.setBy = "Adiksha";
      r.events.push({
        at,
        from: "submitted",
        to: status,
        reason: r.reason,
        remarks,
        source: "desk",
        actor: "Adiksha",
        pushed: !!r.brokerId,
      });
    }

    referrals.push(r);
    refSeed = (refSeed + 0x6d2b79f5) | 0;
  };

  const T = (s: string) => s;

  push(
    {
      brokerId: 88,
      client: "Rahul Sharma",
      mobile: "9876543210",
      pan: "ABCPS4821K",
      emp: "salaried",
      amount: 7000000,
      prop: { kind: "openhouse", homeId: 812 },
      source: "property_detail",
      createdAt: T("2026-10-16T12:10"),
      note: "Wants to close before Diwali",
    },
    ["disbursed", "2026-11-10T17:40", null, "Disbursed by HDFC Bank on 10 Nov."],
  );
  push(
    {
      brokerId: 95,
      client: "Nikhil Chawla",
      mobile: "9810556677",
      emp: "self_employed",
      amount: 12000000,
      prop: { kind: "openhouse", homeId: 918 },
      source: "property_detail",
      createdAt: T("2026-10-20T10:00"),
    },
    ["disbursed", "2026-11-20T17:00", null, "Disbursed by Bajaj Housing Finance on 20 Nov."],
  );
  push(
    {
      brokerId: 88,
      client: "Priya Nair",
      mobile: "9810098765",
      emp: "salaried",
      amount: 8500000,
      prop: { kind: "other", name: "ATS Grandstand", city: "Gurgaon" },
      source: "home_card",
      createdAt: T("2026-10-29T10:15"),
    },
    ["disbursed", "2026-12-04T18:05", null, "Disbursed by ICICI Bank on 4 Dec."],
  );
  push(
    {
      brokerId: 88,
      client: "Rohit Bansal",
      mobile: "9873344556",
      emp: "self_employed",
      amount: 9000000,
      prop: { kind: "openhouse", homeId: 877 },
      source: "property_detail",
      createdAt: T("2026-11-05T11:20"),
    },
    [
      "not_converted",
      "2026-11-12T12:00",
      "took_loan_elsewhere",
      "Client went with the bank that holds his salary account.",
    ],
  );
  push({
    brokerId: 88,
    client: "Amit Verma",
    mobile: "9958011223",
    pan: "AQWPV7712M",
    emp: "self_employed",
    amount: 6200000,
    prop: { kind: "openhouse", homeId: 845 },
    source: "visit_completed",
    createdAt: T("2026-11-18T09:40"),
  });
  push(
    {
      brokerId: 95,
      client: "Pooja Singh",
      mobile: "9717766554",
      emp: "salaried",
      amount: 7000000,
      prop: { kind: "other", name: "Ace Divino", city: "Greater Noida" },
      source: "home_card",
      createdAt: T("2026-11-21T11:00"),
    },
    [
      "not_converted",
      "2026-12-15T16:00",
      "not_eligible",
      "Lenders need a higher income for ₹70L. Can be retried with a co-applicant.",
    ],
  );
  push({
    brokerId: 88,
    client: "Sneha Kapoor",
    mobile: "9711223344",
    emp: "salaried",
    amount: 5500000,
    prop: { kind: "other", name: "Ireo Victory Valley", city: "Gurgaon" },
    source: "home_card",
    createdAt: T("2026-12-02T12:00"),
  });
  push({
    brokerId: 88,
    client: "Karan Malhotra",
    mobile: "9999012345",
    emp: "salaried",
    amount: 4800000,
    prop: { kind: "openhouse", homeId: 861 },
    source: "home_card",
    createdAt: T("2026-12-12T10:30"),
  });
  push({
    brokerId: null,
    referrerType: "desk",
    client: "Sanjay Gupta",
    mobile: "9891122334",
    emp: "self_employed",
    amount: 6000000,
    prop: { kind: "openhouse", homeId: 946 },
    source: "dashboard_crm",
    createdAt: T("2026-12-14T12:00"),
    createdByDesk: true,
  });
  push({
    brokerId: 91,
    client: "Anjali Rao",
    mobile: "9810233445",
    emp: "salaried",
    amount: 7500000,
    prop: { kind: "openhouse", homeId: 903 },
    source: "home_card",
    createdAt: T("2026-12-18T10:05"),
  });
  push({
    brokerId: 88,
    client: "Meera Iyer",
    mobile: "9654321098",
    prop: { kind: "other", name: "Supertech Araville", city: "Gurgaon" },
    source: "loans_home",
    createdAt: T("2026-12-19T16:20"),
  });
  push({
    brokerId: 88,
    client: "Deepak Jain",
    mobile: "9821456789",
    emp: "salaried",
    amount: 5000000,
    prop: { kind: "other", name: "Signature Global Park", city: "Gurgaon" },
    source: "home_card",
    createdAt: T("2026-12-20T09:45"),
  });

  referrals.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return { referrals, applications: {}, nextId, refSeed, now };
}
