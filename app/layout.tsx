import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { DemoProvider } from "@/lib/demo/store";
import { cn } from "@/lib/utils";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "openhouse · Loans desk",
  description: "Openhouse Loans Desk V1 — lead collection and final status",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", plusJakarta.variable, geistMono.variable, "font-sans")}
    >
      <body className="flex min-h-full flex-col">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
