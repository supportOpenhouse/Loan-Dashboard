import Image from "next/image";
import { cn } from "@/lib/utils";

type Variant = "full" | "mark";
type Tone = "dark" | "light";

const SRC: Record<Variant, Record<Tone, string>> = {
  full: {
    dark: "/brand/openhouse-logo.svg",
    light: "/brand/openhouse-logo-white.svg",
  },
  mark: {
    dark: "/brand/logo-icon.png",
    light: "/brand/openhouse-mark-white.svg",
  },
};

const SIZE: Record<Variant, { width: number; height: number }> = {
  full: { width: 140, height: 28 },
  mark: { width: 28, height: 28 },
};

export function OpenhouseLogo({
  variant = "full",
  tone = "dark",
  className,
  priority,
}: {
  variant?: Variant;
  /** dark = black mark for light backgrounds; light = white mark for dark backgrounds */
  tone?: Tone;
  className?: string;
  priority?: boolean;
}) {
  const { width, height } = SIZE[variant];
  return (
    <Image
      src={SRC[variant][tone]}
      alt="openhouse"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto object-contain object-left", className)}
    />
  );
}
