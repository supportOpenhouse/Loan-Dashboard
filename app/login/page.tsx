"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
          <div className="text-[22px] font-extrabold tracking-tight text-white">
            openhouse
          </div>
          <div className="mt-1 text-[11px] font-semibold tracking-[0.08em] text-rail-foreground uppercase">
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
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-primary-foreground transition-colors hover:bg-[#e64a19] disabled:opacity-60"
          >
            <GoogleMark />
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

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#fff"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        opacity=".9"
      />
      <path
        fill="#fff"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        opacity=".75"
      />
      <path
        fill="#fff"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        opacity=".6"
      />
      <path
        fill="#fff"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        opacity=".85"
      />
    </svg>
  );
}
