"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui";
import { authApi } from "@/services/auth";
import { toast } from "sonner";

function toBase64Url(value: string): string {
  try {
    return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return "";
  }
}

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "verifying" | "verified" | "error">("idle");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (token) verify(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verify = async (tok: string) => {
    setStatus("verifying");
    try {
      await authApi.verifyEmail(tok);
      toast.success("Email verified successfully");
      setStatus("verified");
    } catch {
      setStatus("error");
    }
  };

  const submit = () => {
    if (!email.trim()) {
      toast.error("Enter your email address");
      return;
    }
    setBusy(true);
    verify(toBase64Url(email.trim().toLowerCase())).finally(() => setBusy(false));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white w-fit mx-auto shadow-lg shadow-emerald-500/30">
            <BadgeCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verify Email Address</h1>
          <p className="text-xs text-slate-500">Confirm your identity to secure your SmartCity account.</p>
        </div>

        {status === "verified" ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-emerald-600 font-semibold">Your email has been verified. Thank you!</p>
            <Link href="/login" className="inline-block">
              <Button variant="primary">Continue to Sign In</Button>
            </Link>
          </div>
        ) : status === "verifying" ? (
          <div className="flex items-center justify-center py-6">
            <span className="animate-spin border-2 border-slate-200 border-t-emerald-500 rounded-full w-6 h-6" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {token
                ? "Verifying your email…"
                : "Enter the email you registered with to receive a verification link (demo: verification happens right here)."}
            </p>
            {!token && (
              <>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <Button variant="primary" isLoading={busy} onClick={submit} className="w-full">
                  Verify Email
                </Button>
              </>
            )}
          </div>
        )}

        {status === "error" && (
          <p className="text-sm text-red-500 text-center">We could not verify that email. Please check the link or try again.</p>
        )}

        <div className="text-center text-xs text-slate-500">
          <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
            Back to sign in
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