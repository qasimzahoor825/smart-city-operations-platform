"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Cpu, User, Mail, Phone, Lock, ArrowRight } from "lucide-react";

import { registerSchema, type RegisterFormValues } from "@/schemas/auth";
import { authApi } from "@/services/auth";
import { tokenStore } from "@/services/token-storage";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/auth-slice";
import { extractErrorMessage } from "@/utils/errors";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const session = await authApi.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
      });
      tokenStore.setTokens(session.accessToken, session.refreshToken);
      dispatch(setCredentials({ user: session.user, accessToken: session.accessToken }));
      toast.success("Account created. Welcome to SmartCity OS!");
      router.replace("/citizen/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const fieldError = (key: keyof RegisterFormValues) => (
    <span className="text-xs text-red-500">{errors[key]?.message}</span>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white w-fit mx-auto shadow-lg shadow-blue-500/30">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Resident Account</h1>
          <p className="text-xs text-slate-500">
            Join the digital municipal network for instant city services
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 block">Full Legal Name</label>
            {fieldError("fullName")}
          </div>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Sarah Jenkins"
              autoComplete="name"
              {...register("fullName")}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 block">Email Address</label>
            {fieldError("email")}
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              placeholder="sarah@example.com"
              autoComplete="email"
              {...register("email")}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Phone (optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                autoComplete="tel"
                {...register("phoneNumber")}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 block">Password</label>
            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              placeholder="Create strong password"
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
              placeholder="Repeat password"
              autoComplete="new-password"
              {...register("confirmPassword")}
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
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}