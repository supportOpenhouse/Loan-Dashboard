"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OwnBuyerPill, StatusPill } from "@/components/desk/StatusPill";
import { TABS, brokerById } from "@/lib/demo/constants";
import {
  formatDate,
  formatDateTime,
  formatLakh,
  propertyTitle,
  relativeAge,
} from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/store";
import type { TabKey } from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { DeskShell } from "./DeskShell";

export function LeadsView({ initialQuery = "" }: { initialQuery?: string }) {
  const { counts, filterReferrals, state } = useDemo();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>(initialQuery ? "all" : "submitted");
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) {
      setQ(initialQuery);
      setTab("all");
    }
  }, [initialQuery]);

  const rows = useMemo(
    () => filterReferrals(tab, q),
    [filterReferrals, tab, q],
  );

  const countFor = (key: TabKey) => {
    if (key === "all") return counts.all;
    if (key === "submitted") return counts.submitted;
    if (key === "disbursed") return counts.disbursed;
    return counts.notConverted;
  };

  return (
    <DeskShell searchValue={q} onSearchChange={setQ}>
      <h1 className="text-[18px] font-extrabold tracking-tight">Leads</h1>
      <p className="mt-0.5 max-w-3xl text-[12.5px] text-muted-foreground">
        Every referral from the app, plus leads the desk keys in. Pass client
        details to Ambak, then set the final status with remarks; the broker
        sees both.
      </p>

      <div className="mt-3 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "mb-[-1px] flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-bold whitespace-nowrap",
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            {t.label}
            <span className="rounded-full bg-[#eef0f3] px-1.5 py-0 text-[11px] font-bold text-foreground tabular">
              {countFor(t.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop / tablet table */}
      <div className="mt-3 hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-[13px] tabular">
            <thead>
              <tr className="bg-[#fafbfc]">
                {[
                  "Ref",
                  "Client",
                  "Property",
                  "Broker",
                  "Status",
                  "Received",
                  "Final status set",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b border-border px-2.5 py-2.5 text-left text-[10.5px] font-bold tracking-[0.06em] text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Nothing here{q ? " for that search" : ""}.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const b = r.brokerId ? brokerById(r.brokerId) : null;
                  return (
                    <tr
                      key={r.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/leads/${r.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/leads/${r.id}`);
                        }
                      }}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-[#f8fafc]"
                    >
                      <td className="px-2.5 py-2.5 align-top">
                        <div className="font-mono font-bold">{r.ref}</div>
                        <div className="text-[11.5px] text-muted-foreground">
                          {relativeAge(r.createdAt, state.now)}
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 align-top">
                        <div className="font-bold">{r.client}</div>
                        <div className="font-mono text-[11.5px] text-muted-foreground">
                          {r.mobile}
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 align-top">
                        <div>{propertyTitle(r.prop)}</div>
                        {r.amount ? (
                          <div className="text-[11.5px] text-muted-foreground">
                            {formatLakh(r.amount)} needed
                          </div>
                        ) : null}
                      </td>
                      <td className="px-2.5 py-2.5 align-top">
                        {b ? (
                          <>
                            <div>{b.name}</div>
                            <div className="text-[11.5px] text-muted-foreground">
                              {b.phone}
                            </div>
                          </>
                        ) : (
                          <OwnBuyerPill />
                        )}
                      </td>
                      <td className="px-2.5 py-2.5 align-top">
                        <StatusPill status={r.status} />
                      </td>
                      <td className="px-2.5 py-2.5 align-top text-[12px]">
                        {formatDateTime(r.createdAt)}
                      </td>
                      <td className="px-2.5 py-2.5 align-top text-[12px]">
                        {r.setAt ? (
                          <>
                            {formatDate(r.setAt)}
                            <div className="text-muted-foreground">{r.setBy}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="mt-3 space-y-2.5 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-[13px] text-muted-foreground">
            Nothing here{q ? " for that search" : ""}.
          </div>
        ) : (
          rows.map((r) => {
            const b = r.brokerId ? brokerById(r.brokerId) : null;
            return (
              <Link
                key={r.id}
                href={`/leads/${r.id}`}
                className="block rounded-xl border border-border bg-card p-3.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[12px] font-bold text-muted-foreground">
                      {r.ref}
                    </div>
                    <div className="mt-0.5 text-[15px] font-extrabold">
                      {r.client}
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                <div className="mt-2 text-[12.5px] text-muted-foreground">
                  {propertyTitle(r.prop)}
                  {r.amount ? ` · ${formatLakh(r.amount)} needed` : ""}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                  {b ? (
                    <span>
                      {b.name} · {b.phone}
                    </span>
                  ) : (
                    <OwnBuyerPill />
                  )}
                  <span className="text-muted-foreground">
                    · {relativeAge(r.createdAt, state.now)}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </DeskShell>
  );
}
