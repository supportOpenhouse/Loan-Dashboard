"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BROKERS, CITIES, HOMES } from "@/lib/demo/constants";
import { cleanMobile } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/store";
import type { PropertyKind, ReferrerType } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export function NewLeadDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: number) => void;
}) {
  const { createLead, showToast } = useDemo();
  const [rtype, setRtype] = useState<ReferrerType>("broker");
  const [brokerId, setBrokerId] = useState("91");
  const [brokerQ, setBrokerQ] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [propKind, setPropKind] = useState<PropertyKind>("openhouse");
  const [homeId, setHomeId] = useState("903");
  const [otherName, setOtherName] = useState("");
  const [cityId, setCityId] = useState("1");
  const [cityOther, setCityOther] = useState("");
  const [amount, setAmount] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRtype("broker");
    setBrokerId("91");
    setBrokerQ("");
    setName("");
    setMobile("");
    setPropKind("openhouse");
    setHomeId("903");
    setOtherName("");
    setCityId("1");
    setCityOther("");
    setAmount("");
    setConsent(false);
    setErr(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const brokers = useMemo(() => {
    const q = brokerQ.trim().toLowerCase();
    if (!q) return BROKERS;
    return BROKERS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.cp.toLowerCase().includes(q),
    );
  }, [brokerQ]);

  if (!open) return null;

  const submit = () => {
    const amt = amount ? +String(amount).replace(/\D/g, "") : null;
    const prop =
      propKind === "openhouse"
        ? { kind: "openhouse" as const, homeId: +homeId }
        : {
            kind: "other" as const,
            name: otherName.trim(),
            city:
              cityId === "other"
                ? cityOther.trim()
                : CITIES.find((c) => c[0] === cityId)?.[1] || "",
          };

    const result = createLead({
      referrerType: rtype,
      brokerId: rtype === "broker" ? +brokerId : null,
      clientName: name,
      clientMobile: mobile,
      prop,
      amount: amt && amt > 0 ? amt : null,
      consent,
    });

    if (!result.ok) {
      setErr(result.error);
      return;
    }
    showToast(`Lead ${result.referral.ref} created`);
    onCreated(result.referral.id);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-6">
      <div
        role="dialog"
        aria-label="New lead"
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-[14px]"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <h3 className="text-[15px] font-extrabold">New lead</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[9px] border border-border p-1.5"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3.5">
          <Field label="Referred by">
            <div className="flex flex-wrap gap-1.5">
              <Choice
                on={rtype === "broker"}
                onClick={() => setRtype("broker")}
                label="A broker (phone / WhatsApp)"
              />
              <Choice
                on={rtype === "desk"}
                onClick={() => setRtype("desk")}
                label="Our own buyer (CRM)"
              />
            </div>
          </Field>

          {rtype === "broker" && (
            <Field label="Broker" required>
              <input
                value={brokerQ}
                onChange={(e) => setBrokerQ(e.target.value)}
                placeholder="Search name, phone or CP code"
                className="mb-2 h-[34px] w-full rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
              />
              <select
                value={brokerId}
                onChange={(e) => setBrokerId(e.target.value)}
                className="h-[34px] w-full rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
              >
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} · {b.phone} · {b.cp}
                  </option>
                ))}
              </select>
              {brokers.length === 0 && (
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  No broker matches that search.
                </p>
              )}
            </Field>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Client name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-[34px] w-full rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
              />
            </Field>
            <Field label="Client mobile" required>
              <input
                value={mobile}
                onChange={(e) => setMobile(cleanMobile(e.target.value).slice(0, 10))}
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                className="h-[34px] w-full rounded-lg border border-border px-2.5 font-mono text-[13px] outline-none focus:border-ring"
              />
            </Field>
          </div>

          <Field label="Property" required>
            <div className="mb-2 flex flex-wrap gap-1.5">
              <Choice
                on={propKind === "openhouse"}
                onClick={() => setPropKind("openhouse")}
                label="Openhouse property"
              />
              <Choice
                on={propKind === "other"}
                onClick={() => setPropKind("other")}
                label="Other property"
              />
            </div>
            {propKind === "openhouse" ? (
              <select
                value={homeId}
                onChange={(e) => setHomeId(e.target.value)}
                className="h-[34px] w-full rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
              >
                {HOMES.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.soc} · {h.city}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  value={otherName}
                  onChange={(e) => setOtherName(e.target.value)}
                  placeholder="Society or project name"
                  className="h-[34px] w-full rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
                />
                <div className="flex gap-2">
                  <select
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="h-[34px] min-w-0 flex-1 rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
                  >
                    {CITIES.map(([id, n]) => (
                      <option key={id} value={id}>
                        {n}
                      </option>
                    ))}
                    <option value="other">Other city…</option>
                  </select>
                  {cityId === "other" && (
                    <input
                      value={cityOther}
                      onChange={(e) => setCityOther(e.target.value)}
                      placeholder="City"
                      className="h-[34px] min-w-0 flex-1 rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
                    />
                  )}
                </div>
              </div>
            )}
          </Field>

          <Field label="Loan needed (₹)">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="e.g. 6000000"
              className="h-[34px] w-full rounded-lg border border-border px-2.5 text-[13px] outline-none focus:border-ring"
            />
          </Field>

          {err && (
            <div className="rounded-[9px] border border-[#f8c7c7] bg-[#fdecec] px-2.5 py-2 text-[12px] text-[#8f1d1d]">
              {err}
            </div>
          )}

          <label className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              The broker confirmed the client agreed to be contacted.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-[#fafbfc] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] rounded-[9px] border border-border bg-white px-3 text-[12.5px] font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!consent}
            className="h-[34px] rounded-[9px] bg-primary px-3 text-[12.5px] font-bold text-white hover:bg-[#e64a19] disabled:opacity-45"
          >
            Create lead
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase">
        {label}
        {required && <span className="text-[#e5484d]"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Choice({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-[12px] font-bold",
        on
          ? "border-foreground bg-foreground text-white"
          : "border-border bg-white text-foreground",
      )}
    >
      {label}
    </button>
  );
}
