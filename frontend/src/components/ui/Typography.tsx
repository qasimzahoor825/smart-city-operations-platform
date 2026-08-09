import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, children, ...props }, ref) => {
    const styles = {
      1: "text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight",
      2: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900",
      3: "text-xl sm:text-2xl font-bold text-slate-900 tracking-tight",
      4: "text-lg font-bold text-slate-900",
    };

    const Tag = `h${level}` as React.ElementType;

    return (
      <Tag ref={ref} className={cn(styles[level], className)} {...props}>
        {children}
      </Tag>
    );
  }
);
Heading.displayName = "Heading";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "body" | "lead" | "muted" | "caption";
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = "body", children, ...props }, ref) => {
    const styles = {
      body: "text-sm text-slate-600 leading-relaxed",
      lead: "text-lg text-slate-600 leading-relaxed font-medium",
      muted: "text-xs text-slate-500 leading-normal",
      caption: "text-[11px] text-slate-500 font-medium uppercase tracking-wider",
    };

    return (
      <p ref={ref} className={cn(styles[variant], className)} {...props}>
        {children}
      </p>
    );
  }
);
Text.displayName = "Text";

export const GradientText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span ref={ref} className={cn("text-gradient font-extrabold", className)} {...props}>
    {children}
  </span>
));
GradientText.displayName = "GradientText";

export const CodeText = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => (
  <code
    ref={ref}
    className={cn(
      "font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-blue-700",
      className
    )}
    {...props}
  >
    {children}
  </code>
));
CodeText.displayName = "CodeText";
