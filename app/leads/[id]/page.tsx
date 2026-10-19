"use client";

import { Suspense } from "react";
import { LeadDetailView } from "@/components/desk/LeadDetailView";

export default function LeadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LeadDetailView />
    </Suspense>
  );
}
