"use client";

import { Eye, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import {
  DOC_SLOTS,
  isSelfEmployed,
} from "@/lib/demo/application-constants";
import type {
  DocType,
  LoanApplicant,
  LoanDocument,
} from "@/lib/demo/application-types";
import { formatDateTime } from "@/lib/demo/format";
import type { LoanReferral } from "@/lib/demo/types";
import { documentFileMap, useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.heic,.webp,application/pdf,image/*";
const MAX_BYTES = 10 * 1024 * 1024;

function slotVisible(when: string | undefined, emp: string, rent: boolean) {
  if (!when || when === "always") return true;
  if (when === "salaried") return emp === "salaried";
  if (when === "self_employed") return isSelfEmployed(emp);
  if (when === "rent") return rent;
  return true;
}

function DocSlotCard({
  label,
  doc,
  onUpload,
  onVerify,
  onReject,
  onDelete,
  onView,
}: {
  label: string;
  doc: LoanDocument | undefined;
  onUpload: (file: File) => void;
  onVerify: () => void;
  onReject: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const statusColor =
    doc?.status === "verified"
      ? "text-[#15803d]"
      : doc?.status === "rejected"
        ? "text-[#c62828]"
        : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[12.5px] font-bold">{label}</div>
      {doc ? (
        <>
          <div className="mt-1 truncate font-mono text-[11.5px] text-muted-foreground">
            {doc.originalName}
          </div>
          <div className={cn("mt-0.5 text-[11.5px] font-semibold capitalize", statusColor)}>
            {doc.status}
            {doc.status === "rejected" && doc.rejectionNote
              ? ` · ${doc.rejectionNote}`
              : ""}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDateTime(doc.uploadedAt)} ·{" "}
            {(doc.bytes / 1024).toFixed(0)} KB
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={onView}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2 text-[11.5px] font-bold"
            >
              <Eye className="size-3" /> View
            </button>
            {doc.status !== "verified" && (
              <button
                type="button"
                onClick={onVerify}
                className="h-7 rounded-lg border border-[#86efac] bg-[#f0fdf4] px-2 text-[11.5px] font-bold text-[#15803d]"
              >
                Verify
              </button>
            )}
            {doc.status !== "rejected" && (
              <button
                type="button"
                onClick={onReject}
                className="h-7 rounded-lg border border-[#f3b4b4] px-2 text-[11.5px] font-bold text-[#c62828]"
              >
                Reject
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2 text-[11.5px] font-bold"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            PDF / JPG / PNG / HEIC / WEBP · max 10 MB
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 text-[12px] font-bold"
          >
            <Upload className="size-3.5" />
            Upload
          </button>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}

function ApplicantDocs({
  applicant,
  docs,
  onUpload,
  onVerify,
  onReject,
  onDelete,
  onView,
}: {
  applicant: LoanApplicant;
  docs: LoanDocument[];
  onUpload: (docType: DocType, label: string, file: File) => void;
  onVerify: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}) {
  const rent = applicant.currentAddressSameAsAadhaar === false;
  const slots = DOC_SLOTS.filter(
    (s) =>
      s.scope === "applicant" &&
      slotVisible(s.when, applicant.employmentType, rent),
  );

  const title = applicant.isPrimary
    ? `Primary · ${applicant.firstName || "Applicant"}`
    : `Co-applicant · ${applicant.firstName || "Applicant"}`;

  return (
    <section>
      <h4 className="section-label mb-2.5">{title}</h4>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => {
          const doc = docs.find(
            (d) =>
              !d.isDeleted &&
              d.applicantId === applicant.id &&
              d.docType === slot.docType,
          );
          return (
            <DocSlotCard
              key={slot.docType}
              label={slot.label}
              doc={doc}
              onUpload={(file) => onUpload(slot.docType, slot.label, file)}
              onVerify={() => doc && onVerify(doc.id)}
              onReject={() => doc && onReject(doc.id)}
              onDelete={() => doc && onDelete(doc.id)}
              onView={() => doc && onView(doc.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

export function DocumentsTab({ referral }: { referral: LoanReferral }) {
  const {
    state,
    addDocument,
    patchDocument,
    deleteDocument,
    showToast,
  } = useDemo();

  const app = state.applications[String(referral.id)];
  if (!app) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Loading documents…
      </div>
    );
  }

  const liveDocs = app.documents.filter((d) => !d.isDeleted);
  const sorted = [...app.applicants].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleUpload = (
    applicantId: number | null,
    docType: DocType,
    label: string,
    file: File,
  ) => {
    if (file.size > MAX_BYTES) {
      showToast("File must be under 10 MB");
      return;
    }
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const allowed = ["pdf", "jpg", "jpeg", "png", "heic", "webp"];
    if (!allowed.includes(ext)) {
      showToast("Use PDF, JPG, PNG, HEIC, or WEBP");
      return;
    }
    const created = addDocument(referral.id, {
      applicantId,
      docType,
      label,
      originalName: file.name,
      bytes: file.size,
      fileFormat: ext,
    });
    if (created) {
      documentFileMap.set(created.id, file);
      showToast(`Uploaded ${label}`);
    }
  };

  const onView = (id: number) => {
    const file = documentFileMap.get(id);
    if (!file) {
      showToast("File only available in this browser session");
      return;
    }
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const propertySlots = DOC_SLOTS.filter((s) => s.scope === "property");

  return (
    <div className="space-y-5">
      {sorted.map((a) => (
        <ApplicantDocs
          key={a.id}
          applicant={a}
          docs={liveDocs}
          onUpload={(docType, label, file) =>
            handleUpload(a.id, docType, label, file)
          }
          onVerify={(id) => {
            patchDocument(referral.id, id, { status: "verified", rejectionNote: "" });
            showToast("Document verified");
          }}
          onReject={(id) => {
            const note = prompt("Rejection note (optional)") ?? "";
            patchDocument(referral.id, id, {
              status: "rejected",
              rejectionNote: note.trim(),
            });
            showToast("Document rejected");
          }}
          onDelete={(id) => {
            if (confirm("Remove this document?")) {
              deleteDocument(referral.id, id);
              showToast("Document removed");
            }
          }}
          onView={onView}
        />
      ))}

      <section>
        <h4 className="section-label mb-2.5">Property documents</h4>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {propertySlots.map((slot) => {
            const doc = liveDocs.find(
              (d) => d.applicantId == null && d.docType === slot.docType,
            );
            return (
              <DocSlotCard
                key={slot.docType}
                label={slot.label}
                doc={doc}
                onUpload={(file) =>
                  handleUpload(null, slot.docType, slot.label, file)
                }
                onVerify={() => {
                  if (!doc) return;
                  patchDocument(referral.id, doc.id, {
                    status: "verified",
                    rejectionNote: "",
                  });
                  showToast("Document verified");
                }}
                onReject={() => {
                  if (!doc) return;
                  const note = prompt("Rejection note (optional)") ?? "";
                  patchDocument(referral.id, doc.id, {
                    status: "rejected",
                    rejectionNote: note.trim(),
                  });
                  showToast("Document rejected");
                }}
                onDelete={() => {
                  if (doc && confirm("Remove this document?")) {
                    deleteDocument(referral.id, doc.id);
                    showToast("Document removed");
                  }
                }}
                onView={() => doc && onView(doc.id)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
