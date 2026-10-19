"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OpenhouseLogo } from "@/components/brand/OpenhouseLogo";
import { DESK_USERS } from "@/lib/demo/constants";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { user, ready, login } = useDemo();
  const router = useRouter();
  const [selected, setSelected] = useState("desk");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  const handleSignIn = () => {
    setSigningIn(true);
    login(selected);
    router.replace("/");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex flex-col justify-between bg-rail px-8 py-10 text-rail-foreground lg:w-[42%] lg:px-12 lg:py-14">
        <div>
          <OpenhouseLogo tone="light" className="h-7 w-[148px]" priority />
          <div className="mt-2 text-[11px] font-semibold tracking-[0.08em] text-rail-foreground uppercase">
            Loans desk · V1
          </div>
          <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-[#a8b2bd]">
            Every referral from the Partner App, plus leads the desk keys in.
            Pass client details to Ambak by hand, then set one final status with
            remarks the broker sees.
          </p>
        </div>
        <p className="mt-10 text-[12px] text-[#8b97a4] lg:mt-0">
          Demo mode · no live core API · V2 adds calls, documents, Ambak API,
          payouts.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-background px-5 py-12 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
          <OpenhouseLogo tone="dark" className="mb-5 h-6 w-[128px]" />
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Sign in
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Demo Google accounts for the loan desk. Pick a role to continue.
          </p>

          <div className="mt-6 space-y-2">
            {DESK_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelected(u.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  selected === u.id
                    ? "border-foreground bg-foreground text-white"
                    : "border-border bg-white hover:bg-muted/60",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                    selected === u.id
                      ? "bg-white/15 text-white"
                      : "bg-muted text-foreground",
                  )}
                >
                  {u.name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold">{u.name}</span>
                  <span
                    className={cn(
                      "block text-[12px]",
                      selected === u.id ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {u.email} · {u.role === "admin" ? "Admin" : "Loan desk"}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-white text-[14px] font-bold text-foreground transition-colors hover:bg-muted/60 disabled:opacity-60"
          >
            <Image
              src="/brand/google.svg"
              alt=""
              width={18}
              height={18}
              className="size-[18px]"
            />
            Continue with Google
          </button>

          <p className="mt-4 text-center text-[11.5px] text-muted-foreground">
            @openhouse.in accounts only in production. This build uses local demo
            data.
          </p>
        </div>
      </main>
    </div>
  );
}
