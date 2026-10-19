"use client";

import type { LoanApplication } from "@/lib/demo/application-types";
import { Field, inputClass, textareaClass } from "./FormControls";

export function ConsentHandoff({
  app,
  onReconfirm,
  onAmbakId,
  onDeskNotes,
  onBlur,
}: {
  app: LoanApplication;
  onReconfirm: () => void;
  onAmbakId: (id: string) => void;
  onDeskNotes: (notes: string) => void;
  onBlur: () => void;
}) {
  return (
    <section className="mt-4 rounded-xl border border-border bg-card p-3.5">
      <h4 className="section-label mb-3">Consent and hand-off</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-start gap-2 text-[13px] sm:col-span-2">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-primary"
            checked={!!app.consentReconfirmedAt}
            onChange={(e) => {
              if (e.target.checked) onReconfirm();
            }}
          />
          <span>
            Client re-confirmed consent on the call
            {app.consentReconfirmedAt && app.consentReconfirmedBy && (
              <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                Confirmed by {app.consentReconfirmedBy}
              </span>
            )}
          </span>
        </label>

        <Field label="Ambak lead id">
          <input
            className={inputClass}
            value={app.ambakLeadId}
            placeholder="e.g. AMB-55231"
            onChange={(e) => onAmbakId(e.target.value)}
            onBlur={onBlur}
            disabled={!app.consentReconfirmedAt}
          />
          {!app.consentReconfirmedAt && (
            <div className="mt-0.5 text-[11.5px] text-muted-foreground">
              Re-confirm consent first
            </div>
          )}
        </Field>

        <Field label="Desk notes (internal)" className="sm:col-span-2">
          <textarea
            className={textareaClass}
            rows={2}
            value={app.deskNotes}
            onChange={(e) => onDeskNotes(e.target.value)}
            onBlur={onBlur}
            placeholder="Never shown to the broker or client"
          />
        </Field>
      </div>
    </section>
  );
}
