import { brokerById, homeById, REASONS, STATUS_META } from "./constants";
import type { LoanReferral, NotConvertedReason, PropertyRef } from "./types";

const TZ = "Asia/Kolkata";

export function formatLakh(n: number | null | undefined): string {
  if (n == null || !n) return "—";
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  return `₹${+(n / 1e5).toFixed(2)}L`;
}

export function formatDate(iso: string, withYear = false): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" as const } : {}),
    timeZone: TZ,
  });
}

export function formatTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: TZ,
    })
    .toLowerCase();
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function relativeAge(iso: string, now: string): string {
  const m = Math.round((+new Date(now) - +new Date(iso)) / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export function propertyTitle(prop: PropertyRef): string {
  if (prop.kind === "openhouse" && prop.homeId) {
    const h = homeById(prop.homeId);
    return h ? `${h.soc} · ${h.city}` : "Openhouse property";
  }
  return `${prop.name || "Property"} · ${prop.city || ""}`;
}

export function statusLabel(status: LoanReferral["status"]): string {
  return STATUS_META[status].label;
}

export function reasonLabel(reason: NotConvertedReason | null): string {
  return reason ? REASONS[reason] : "";
}

export function employmentLabel(emp: LoanReferral["emp"]): string {
  if (emp === "salaried") return "Salaried";
  if (emp === "self_employed") return "Self-employed";
  return "—";
}

export function sourceLabel(source: string, createdByDesk: boolean): string {
  if (createdByDesk) return "keyed in by desk";
  return "from app";
}

export function copyForAmbak(r: LoanReferral): string {
  return [
    `Client: ${r.client}`,
    `Mobile: ${r.mobile}`,
    `PAN: ${r.pan || "—"}`,
    `Works as: ${employmentLabel(r.emp)}`,
    `Loan needed: ${r.amount ? formatLakh(r.amount) : "—"}`,
    `Property: ${propertyTitle(r.prop).replace(" · ", ", ")}`,
  ].join("\n");
}

export function brokerDisplay(brokerId: number | null) {
  if (!brokerId) return null;
  return brokerById(brokerId) ?? null;
}

export function cleanMobile(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}
