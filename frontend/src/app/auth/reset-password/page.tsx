"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, KeyRound } from "lucide-react";

import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth";
import { authApi } from "@/services/auth";
import { extractErrorMessage } from "@/utils/errors";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Missing reset token. Request a new reset link.");
      return;
    }
    try {
      await authApi.resetPassword(token, values.password);
      toast.success("Password reset successfully. Please sign in.");
      router.replace("/login");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white w-fit mx-auto shadow-lg shadow-blue-500/30">
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
        <p className="text-xs text-slate-500">Choose a new strong password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600 block">New Password</label>
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            {...register("password")}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600 block">Confirm Password</label>
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
          )}
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="password"
            placeholder="Repeat new password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
        >
          {isSubmitting
            ? "Updating..."
            : "Update Password"}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        <Link href="/login" className="text-sky-600 font-semibold hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 text-sm">Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}