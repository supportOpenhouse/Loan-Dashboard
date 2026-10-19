"use client";

import {
  ChevronDown,
  List,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { OpenhouseLogo } from "@/components/brand/OpenhouseLogo";
import { Toast } from "@/components/desk/Toast";
import { NewLeadDialog } from "@/components/desk/NewLeadDialog";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

export function DeskShell({
  children,
  searchValue,
  onSearchChange,
}: {
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (q: string) => void;
}) {
  const { user, ready, logout, resetDemo, counts } = useDemo();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onCreated = useCallback(
    (id: number) => {
      setNewLeadOpen(false);
      router.push(`/leads/${id}?tab=application`);
    },
    [router],
  );

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  const roleLabel = user.role === "admin" ? "Admin" : "Loan desk";

  const rail = (
    <>
      <div className="px-2 pb-3.5">
        <OpenhouseLogo tone="light" className="h-6 w-[120px]" priority />
        <div className="mt-1.5 text-[11px] font-semibold tracking-[0.06em] text-rail-foreground uppercase">
          Loans desk · V1
        </div>
      </div>

      <Link
        href="/"
        className={cn(
          "flex items-center gap-2.5 rounded-[9px] px-2.5 py-2.5 text-[13px] font-semibold transition-colors",
          pathname === "/" || pathname.startsWith("/leads")
            ? "bg-white/10 text-white"
            : "text-rail-foreground hover:bg-white/5 hover:text-white",
        )}
      >
        <List className="size-4 shrink-0" />
        Leads
        <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10.5px] font-bold text-white tabular">
          {counts.submitted}
        </span>
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-[196px] shrink-0 flex-col bg-rail p-4 text-rail-foreground lg:flex">
        {rail}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative flex h-full w-[220px] flex-col bg-rail p-4 text-rail-foreground shadow-xl">
            <button
              type="button"
              className="absolute top-3 right-3 rounded-lg p-1.5 text-rail-foreground hover:bg-white/10"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            {rail}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2.5 border-b border-border bg-card px-3 py-3 sm:px-4.5 lg:px-[18px]">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-[9px] border border-border lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[9px] border border-border px-2.5 text-muted-foreground sm:max-w-[440px]">
            <Search className="size-4 shrink-0" />
            <input
              type="search"
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search reference, client, mobile or broker"
              className="h-[34px] min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <button
            type="button"
            onClick={() => setNewLeadOpen(true)}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] bg-primary px-3 text-[12.5px] font-bold text-white hover:bg-[#e64a19]"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">New lead</span>
            <span className="sm:hidden">New</span>
          </button>

          <div className="relative ml-auto" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-[9px] border border-border bg-card px-2.5 py-1.5 text-left text-[12.5px] font-semibold"
            >
              <span className="hidden text-muted-foreground sm:inline">
                Viewing as
              </span>
              <span>
                {user.name}
                <span className="text-muted-foreground"> · {roleLabel}</span>
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
                <div className="border-b border-border px-3 py-2">
                  <div className="text-[12px] font-bold">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {user.email}
                  </div>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-[12.5px] font-semibold hover:bg-muted"
                  onClick={() => {
                    setMenuOpen(false);
                    resetDemo();
                  }}
                >
                  <RefreshCw className="size-3.5" />
                  Reset demo
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-[12.5px] font-semibold hover:bg-muted"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    router.replace("/login");
                  }}
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto px-3 py-4 sm:px-[18px] sm:py-4 lg:pb-6">
          {children}
        </main>
      </div>

      <NewLeadDialog
        open={newLeadOpen}
        onClose={() => setNewLeadOpen(false)}
        onCreated={onCreated}
      />
      <Toast />
    </div>
  );
}
