"use client";

import { ArrowLeft, Bell, Copy, Shield } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FinalStatusPanel } from "@/components/desk/FinalStatusPanel";
import { DeskShell } from "@/components/desk/DeskShell";
import { StatusPill } from "@/components/desk/StatusPill";
import { brokerById, REASONS, STATUS_META } from "@/lib/demo/constants";
import {
  copyForAmbak,
  employmentLabel,
  formatDate,
  formatDateTime,
  formatLakh,
  propertyTitle,
  sourceLabel,
} from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/store";
import { useState } from "react";

export function LeadDetailView() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { getReferral, showToast, ready } = useDemo();
  const referral = getReferral(id);
  const router = useRouter();
  const [q, setQ] = useState("");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!referral) {
    return (
      <DeskShell searchValue={q} onSearchChange={(v) => {
        setQ(v);
        if (v) router.push(`/?q=${encodeURIComponent(v)}`);
      }}>
        <Link
          href="/"
          className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
        >
          <ArrowLeft className="size-3.5" />
          Leads
        </Link>
        <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Lead not found.
        </div>
      </DeskShell>
    );
  }

  const broker = referral.brokerId ? brokerById(referral.brokerId) : null;
  const ambak = copyForAmbak(referral);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(ambak);
      showToast("Copied to clipboard");
    } catch {
      showToast("Could not copy");
    }
  };

  return (
    <DeskShell
      searchValue={q}
      onSearchChange={(v) => {
        setQ(v);
        if (v.trim()) router.push(`/?q=${encodeURIComponent(v)}`);
      }}
    >
      <Link
        href="/"
        className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
      >
        <ArrowLeft className="size-3.5" />
        Leads
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[12px] font-bold text-muted-foreground">
            {referral.ref} ·{" "}
            {sourceLabel(referral.source, referral.createdByDesk)} ·{" "}
            {referral.source.replace(/_/g, " ")}
          </div>
          <div className="mt-0.5 text-[17px] font-extrabold">
            {referral.client}{" "}
            <span className="font-mono text-[12.5px] font-semibold text-muted-foreground">
              {referral.mobile}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={referral.status} />
          <span className="text-[11.5px] text-muted-foreground">
            Broker sees:{" "}
            <b className="text-foreground">
              {STATUS_META[referral.status].label}
            </b>
          </span>
        </div>
      </div>

      <div className="mt-3.5 grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3">
          <section className="rounded-xl border border-border bg-card p-3.5">
            <h4 className="section-label mb-2.5">Broker · internal only</h4>
            {broker ? (
              <>
                <div className="text-[15px] font-extrabold">{broker.name}</div>
                <div className="text-[11.5px] text-muted-foreground">
                  {broker.company} · {broker.cp}
                </div>
                <div className="mt-1 font-mono text-[12px]">{broker.phone}</div>
                <div className="mt-2 flex items-start gap-1.5 rounded-[9px] border border-[#fde7b0] bg-[#fff8e6] px-2.5 py-2 text-[12px] text-[#7a4a00]">
                  <Shield className="mt-0.5 size-3.5 shrink-0" />
                  Never shared with Ambak or the bank.
                </div>
              </>
            ) : (
              <>
                <div className="font-bold">Openhouse&apos;s own buyer</div>
                <div className="text-[11.5px] text-muted-foreground">
                  CRM hand-off · no partner commission
                </div>
              </>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-3.5">
            <h4 className="section-label mb-2.5">Activity</h4>
            <div>
              {[...referral.events].reverse().map((e, i) => (
                <div
                  key={`${e.at}-${i}`}
                  className="grid grid-cols-[10px_1fr] gap-2 border-b border-dashed border-border py-2 last:border-0"
                >
                  <i
                    className={`mt-1.5 size-2 rounded-full ${
                      e.to !== "submitted" ? "bg-primary" : "bg-[#c4cdd5]"
                    }`}
                  />
                  <div>
                    <div className="text-[13px] font-bold">
                      {e.from
                        ? `${STATUS_META[e.from].label} → `
                        : "Lead received · "}
                      {STATUS_META[e.to].label}
                    </div>
                    <div className="text-[11.5px] text-muted-foreground">
                      {formatDateTime(e.at)} · {e.actor}
                    </div>
                    {e.reason && (
                      <div className="mt-0.5 text-[12px] text-muted-foreground">
                        {REASONS[e.reason]}
                      </div>
                    )}
                    {e.remarks && (
                      <div className="mt-0.5 text-[12px] text-[#c2410c]">
                        Broker saw: “{e.remarks}”
                      </div>
                    )}
                    {e.pushed && (
                      <div className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                        <Bell className="size-2.5" /> push sent
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-3.5">
              <h4 className="section-label mb-2.5">Lead</h4>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12.5px]">
                <dt className="text-muted-foreground">Client</dt>
                <dd className="text-right font-semibold break-words">
                  {referral.client}
                </dd>
                <dt className="text-muted-foreground">Mobile</dt>
                <dd className="text-right font-mono font-semibold">
                  {referral.mobile}
                </dd>
                <dt className="text-muted-foreground">PAN</dt>
                <dd className="text-right font-mono font-semibold">
                  {referral.pan || "—"}
                </dd>
                <dt className="text-muted-foreground">Property</dt>
                <dd className="text-right font-semibold break-words">
                  {propertyTitle(referral.prop)}
                </dd>
                <dt className="text-muted-foreground">Loan needed</dt>
                <dd className="text-right font-semibold">
                  {referral.amount ? formatLakh(referral.amount) : "—"}
                </dd>
                <dt className="text-muted-foreground">Works as</dt>
                <dd className="text-right font-semibold">
                  {employmentLabel(referral.emp)}
                </dd>
                <dt className="text-muted-foreground">Broker note</dt>
                <dd className="text-right font-semibold break-words">
                  {referral.note || "—"}
                </dd>
                <dt className="text-muted-foreground">Consent</dt>
                <dd className="text-right font-semibold">
                  Given {formatDate(referral.createdAt)} · v1
                </dd>
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-card p-3.5">
              <h4 className="section-label mb-2.5">Copy for Ambak</h4>
              <pre className="m-0 whitespace-pre-wrap rounded-xl border border-border bg-[#f9fafb] p-2.5 font-mono text-[12px]">
                {ambak}
              </pre>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copyText}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
                >
                  <Copy className="size-3.5" />
                  Copy
                </button>
                <span className="text-[11.5px] text-muted-foreground">
                  Client details only. No broker fields.
                </span>
              </div>
            </section>
          </div>

          <FinalStatusPanel referral={referral} />
        </div>
      </div>
    </DeskShell>
  );
}
