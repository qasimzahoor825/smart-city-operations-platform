"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/services/auth";
import { tokenStore } from "@/services/token-storage";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/auth-slice";
import { roleHome } from "@/constants/navigation";
import { extractErrorMessage } from "@/utils/errors";
import { verifyOtpSchema } from "@/schemas/auth";

const RESEND_COOLDOWN_SECONDS = 30;

function VerifyEmailInner() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useSearchParams();
  const emailParam = params?.get("email") ?? "";

  const [email, setEmail] = React.useState(emailParam ? decodeURIComponent(emailParam) : "");
  const [otp, setOtp] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [emailParam]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = verifyOtpSchema.safeParse({ otp });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid code");
      return;
    }
    if (!email.trim()) {
      toast.error("Enter the email you registered with");
      return;
    }
    setBusy(true);
    try {
      const session = await authApi.verifyOtp(email.trim().toLowerCase(), otp.trim());
      tokenStore.setTokens(session.accessToken, session.refreshToken);
      dispatch(setCredentials({ user: session.user, accessToken: session.accessToken }));
      toast.success(`Email verified. Welcome, ${session.user.fullName.split(" ")[0]}!`);
      router.replace(roleHome(session.user.role));
      router.refresh();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      toast.error("Enter the email you registered with");
      return;
    }
    setResent(true);
    try {
      const result = await authApi.resendOtp(email.trim().toLowerCase());
      toast.success(result.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setResent(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white w-fit mx-auto shadow-lg shadow-emerald-500/30">
            <BadgeCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verify Your Email</h1>
          <p className="text-xs text-slate-500">
            We sent a 6-digit code to your email and SMS. Enter it below to finish signing up — it
            expires in 10 minutes.
          </p>
        </div>

        <form onSubmit={verify} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="verify-email" className="text-xs font-semibold text-slate-700 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="verify-otp" className="text-xs font-semibold text-slate-700 block">
              Verification Code
            </label>
            <input
              id="verify-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-center text-2xl font-bold tracking-[0.6em] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Enter the code exactly as it appears in the email.
            </p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {busy ? (
              <span className="animate-spin border-2 border-white/40 border-t-white rounded-full w-4 h-4" />
            ) : (
              "Verify & Continue"
            )}
          </button>

          <button
            type="button"
            onClick={resend}
            disabled={resent || cooldown > 0}
            className="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${resent ? "animate-spin" : ""}`} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already verified?{" "}
          <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailInner />
    </React.Suspense>
  );
}