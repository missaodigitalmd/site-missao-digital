import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "system" | "ghost" | "danger" | "neutral";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-mono uppercase tracking-wide text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none min-h-[44px] px-4";

const variants: Record<Variant, string> = {
  system:
    "bg-system/15 text-system border border-system/40 hover:bg-system/25 active:bg-system/30",
  ghost:
    "bg-transparent text-text-secondary border border-hairline hover:text-text-primary hover:border-system/40",
  danger: "bg-red/15 text-red border border-red/40 hover:bg-red/25",
  neutral: "bg-bg-surface-2 text-text-primary border border-hairline hover:border-system/40",
};

export function Button({ variant = "neutral", className, ...rest }: Props) {
  return <button className={cn(base, variants[variant], className)} {...rest} />;
}
