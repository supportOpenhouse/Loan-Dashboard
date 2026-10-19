"use client";

import { useDemo } from "@/lib/demo/store";

export function Toast() {
  const { toast } = useDemo();
  if (!toast) return null;
  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-50 max-w-sm rounded-[10px] bg-foreground px-3.5 py-2.5 text-[12.5px] text-white shadow-lg"
    >
      {toast}
    </div>
  );
}
