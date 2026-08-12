"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Shield,
  Handshake,
  Key,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { Route } from "next";

import { authApi } from "@/services/auth";
import { tokenStore } from "@/services/token-storage";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/auth-slice";
import { isAxiosError } from "@/utils/errors";

type RoleType = "CITIZEN" | "OFFICER" | "DEPARTMENT_HEAD" | "SUPER_ADMIN";

const ROLE_CONFIGS: Record<
  RoleType,
  { label: string; icon: React.ElementType; defaultEmail: string; defaultPassword?: string }
> = {
  CITIZEN: {
    label: "Citizen",
    icon: User,
    defaultEmail: "citizen@smartcity.gov",
    defaultPassword: "Citizen@1234",
  },
  OFFICER: {
    label: "Officer",
    icon: Shield,
    defaultEmail: "officer@publicworks.gov",
    defaultPassword: "Officer@1234",
  },
  DEPARTMENT_HEAD: {
    label: "Department Head",
    icon: Handshake,
    defaultEmail: "head@publicworks.gov",
    defaultPassword: "Officer@1234",
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: Key,
    defaultEmail: "superadmin@smartcity.gov",
    defaultPassword: "Admin@1234",
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [selectedRole, setSelectedRole] = React.useState<RoleType>("DEPARTMENT_HEAD");
  const [email, setEmail] = React.useState("head@publicworks.gov");
  const [password, setPassword] = React.useState("Officer@1234");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid =
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  const CheckMark = ({ show }: { show: boolean }) =>
    show ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3 pointer-events-none" />
    ) : null;

  // Update default email when role changes
  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setEmail(ROLE_CONFIGS[role].defaultEmail);
    setPassword(ROLE_CONFIGS[role].defaultPassword ?? "");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const session = await authApi.login({ email, password, rememberMe });

      tokenStore.setTokens(session.accessToken, session.refreshToken);
      dispatch(setCredentials({ user: session.user, accessToken: session.accessToken }));

      toast.success(`Signed in as ${ROLE_CONFIGS[selectedRole].label}`);

      const next = searchParams.get("next");
      const targetRoute =
        selectedRole === "SUPER_ADMIN"
          ? "/admin/dashboard"
          : selectedRole === "OFFICER"
          ? "/department/officer"
          : selectedRole === "DEPARTMENT_HEAD"
          ? "/department/dashboard"
          : "/citizen/dashboard";

      router.replace((next && next.startsWith("/") ? next : targetRoute) as Route);
      router.refresh();
    } catch (err) {
      if (
        isAxiosError(err) &&
        err.response?.status === 403 &&
        /not verified|verification/i.test(err.response.data?.message ?? "")
      ) {
        toast.error(err.response.data?.message ?? "Please verify your email first.");
        const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}` as Route;
        router.replace(verifyUrl);
        return;
      }
      toast.error("Failed to sign in. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header Title matching Screenshot 02 */}
      <div className="text-center max-w-xl mx-auto mb-8 pt-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Welcome to SmartCity
        </h1>
      </div>

      {/* Main Split Container matching Screenshot 02 */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Smart city image like the reference login screen */}
        <div className="lg:col-span-6 relative min-h-[420px] overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/services.jpg"
            alt="Illustrated smart city with transit, government buildings, solar roofs, and connected streets"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Eco Grid Active</span>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-teal-700">Transit Online</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">IoT Mesh Live</span>
            </div>
          </div>
        </div>

        {/* Right Column: Login Card matching Screenshot 02 */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Login to Your Account
            </h2>

            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              
              {/* Role Selection Interactive Grid matching Screenshot 02 */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Role Selection
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(ROLE_CONFIGS) as RoleType[]).map((key) => {
                    const cfg = ROLE_CONFIGS[key];
                    const Icon = cfg.icon;
                    const isSelected = selectedRole === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => handleRoleSelect(key)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                          isSelected
                            ? "border-teal-600 bg-teal-50/50 text-teal-800 ring-2 ring-teal-600/30 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 mb-1.5 ${
                            isSelected ? "text-teal-700" : "text-slate-500"
                          }`}
                        />
                        <span className="text-xs font-bold leading-tight">
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email Address Input */}
              <div className="space-y-1.5">
                <label htmlFor="email-input" className="text-xs font-semibold text-slate-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="head@publicworks.gov"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                  <CheckMark show={emailValid} />
                </div>
              </div>

              {/* Password Input with eye toggle */}
              <div className="space-y-1.5">
                <label htmlFor="password-input" className="text-xs font-semibold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    required
                  />
                  <CheckMark show={passwordValid} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button & Forgot Password */}
              <div className="flex items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl smart-btn-navy text-sm font-semibold shadow flex items-center justify-center gap-2 flex-1"
                >
                  {loading ? (
                    <span className="animate-spin border-2 border-white/40 border-t-white rounded-full w-4 h-4" />
                  ) : (
                    "Login"
                  )}
                </button>

                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline whitespace-nowrap"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-teal-600 h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="remember-me" className="text-xs text-slate-600 cursor-pointer">
                  Remember me.
                </label>
              </div>

              {/* Secondary CTA Button */}
              <div className="pt-2">
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-teal-700 font-semibold text-sm flex items-center justify-center transition-colors"
                >
                  Create Citizen Account
                </Link>
              </div>
            </form>
          </div>

          {/* Secure Authentication Badge Footer matching Screenshot 02 */}
          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Secure Authentication. Your connection is encrypted.</span>
            </p>
          </div>
        </div>

      </div>

      <footer className="text-center text-xs text-slate-400 pt-8">
        (c) 2024 Metropolis Government. SmartCity Operations Platform.
      </footer>
    </div>
  );
}
