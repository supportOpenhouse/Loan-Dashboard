"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeadsView } from "@/components/desk/LeadsView";
import { useDemo } from "@/lib/demo/store";

function LeadsPageInner() {
  const { user, ready } = useDemo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get("q") || "";

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <LeadsView initialQuery={qFromUrl} />;
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LeadsPageInner />
    </Suspense>
  );
}
