"use client";

import { cn } from "@/lib/utils";
import { formatLakh } from "@/lib/demo/format";

export function Field({
  label,
  required,
  ambak,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  ambak?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase">
        {label}
        {required && <span className="text-[#e5484d]"> *</span>}
        {ambak && (
          <span className="ml-1 font-semibold normal-case tracking-normal text-[#0f6b3e]">
            Ambak
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "h-[34px] w-full rounded-lg border border-border bg-white px-2.5 text-[13px] text-foreground outline-none focus:border-ring";

export const textareaClass =
  "w-full resize-y rounded-lg border border-border bg-white px-2.5 py-2 text-[13px] outline-none focus:border-ring";

export function MoneyInput({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  const raw = value == null ? "" : String(value);
  return (
    <div>
      <input
        className={inputClass}
        inputMode="numeric"
        value={raw}
        placeholder={placeholder || "e.g. 7000000"}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onChange(digits ? +digits : null);
        }}
        onBlur={onBlur}
      />
      <div className="mt-0.5 text-[11.5px] text-muted-foreground">
        {value ? formatLakh(value) : "In rupees"}
      </div>
    </div>
  );
}

export function YesNoToggle({
  value,
  onChange,
  onBlur,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  onBlur?: () => void;
}) {
  return (
    <div className="flex gap-1.5" onBlur={onBlur}>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "h-[34px] rounded-lg border px-3 text-[12px] font-bold",
          value === false
            ? "border-foreground bg-foreground text-white"
            : "border-border bg-white",
        )}
      >
        No
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "h-[34px] rounded-lg border px-3 text-[12px] font-bold",
          value === true
            ? "border-foreground bg-foreground text-white"
            : "border-border bg-white",
        )}
      >
        Yes
      </button>
    </div>
  );
}

export function ChoiceButtons({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[12px] font-bold",
            value === o.value
              ? "border-foreground bg-foreground text-white"
              : "border-border bg-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
