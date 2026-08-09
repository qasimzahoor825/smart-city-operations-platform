import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline";
  pulse?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", pulse = false, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-all border";

    const variants = {
      default: "bg-sky-50 text-sky-700 border-sky-100",
      secondary: "bg-violet-50 text-violet-700 border-violet-100",
      success: "bg-emerald-50 text-emerald-700 border-emerald-100",
      warning: "bg-amber-50 text-amber-700 border-amber-100",
      destructive: "bg-red-50 text-red-700 border-red-100",
      info: "bg-cyan-50 text-cyan-700 border-cyan-100",
      outline: "bg-transparent text-slate-600 border-slate-300",
    };

    const pulseColors = {
      default: "bg-sky-500",
      secondary: "bg-violet-500",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      destructive: "bg-red-500",
      info: "bg-cyan-500",
      outline: "bg-slate-500",
    };

    return (
      <span ref={ref} className={cn(baseStyles, variants[variant], className)} {...props}>
        {pulse && (
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                pulseColors[variant]
              )}
            />
            <span
              className={cn("relative inline-flex rounded-full h-2 w-2", pulseColors[variant])}
            />
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
