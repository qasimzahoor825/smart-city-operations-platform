"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/auth";
import { authApi } from "@/services/auth";
import { extractErrorMessage } from "@/utils/errors";

export default function ForgotPasswordPage() {
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const res = await authApi.forgotPassword(values.email);
      toast.success(res?.message ?? "Reset link sent");
      if (res.resetToken) setDemoToken(res.resetToken);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 max-w-md w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white w-fit mx-auto shadow-lg shadow-blue-500/30">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="text-xs text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600 block">Email Address</label>
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="email"
            placeholder="user@smartcity.gov"
            autoComplete="email"
            {...register("email")}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting ? (
            <span className="animate-spin border-2 border-white/40 border-t-white rounded-full w-4 h-4" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Reset Link</span>
            </>
          )}
        </button>
      </form>

      {demoToken && (
        <div className="rounded-xl bg-sky-50 border border-sky-200 p-3 text-xs text-slate-700 space-y-2">
          <p className="font-semibold text-slate-700">Demo reset token (emailed in production):</p>
          <p className="font-mono text-slate-500 break-all">{demoToken}</p>
          <Link
            href={`/auth/reset-password?token=${encodeURIComponent(demoToken)}`}
            className="text-sky-600 font-semibold hover:underline"
          >
            Continue to reset →
          </Link>
        </div>
      )}

      <div className="text-center text-xs text-slate-500">
        Remembered it?{" "}
        <Link href="/login" className="text-sky-600 font-semibold hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}