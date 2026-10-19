"use client";

import { Copy, X } from "lucide-react";
import { buildSaathiSheet } from "@/lib/demo/saathi-sheet";
import type { LoanApplication } from "@/lib/demo/application-types";

export function SaathiSheetPanel({
  app,
  onClose,
  onCopy,
}: {
  app: LoanApplication;
  onClose: () => void;
  onCopy: (msg: string) => void;
}) {
  const sections = buildSaathiSheet(app);

  const copyField = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      onCopy(`Copied ${label}`);
    } catch {
      onCopy("Could not copy");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-[15px] font-extrabold">Saathi sheet</h3>
          <p className="text-[11.5px] text-muted-foreground">
            Client details only · no broker fields
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[9px] border border-border p-1.5"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {sections.map((s) => (
          <div key={s.title} className="mb-4">
            <h4 className="section-label mb-2">{s.title}</h4>
            {s.fields.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">Nothing filled yet</p>
            ) : (
              <ul className="space-y-1.5">
                {s.fields.map((f) => (
                  <li
                    key={`${s.title}-${f.label}`}
                    className="flex items-start justify-between gap-2 border-b border-dashed border-border py-1.5 text-[12.5px]"
                  >
                    <div className="min-w-0">
                      <div className="text-muted-foreground">{f.label}</div>
                      <div className="font-semibold break-words">{f.value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyField(f.label, f.value)}
                      className="shrink-0 text-[#c2410c]"
                      aria-label={`Copy ${f.label}`}
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
