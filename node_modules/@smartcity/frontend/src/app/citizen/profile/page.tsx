"use client";

import React from "react";
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { authApi } from "@/services/auth";
import { useAuth } from "@/hooks/auth";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/auth-slice";
import { toast } from "sonner";

export default function CitizenProfilePage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = React.useState(user?.fullName ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [phone, setPhone] = React.useState(user?.phoneNumber ?? "");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phoneNumber ?? "");
    }
  }, [user]);

  const save = async () => {
    setBusy(true);
    try {
      const updated = await authApi.updateProfile({ fullName, email, phoneNumber: phone });
      dispatch(setUser(updated));
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setBusy(false);
    }
  };

  const initials = (user?.fullName ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <PageContainer title="Citizen Profile" description="Manage your identity, contact details, and verification status.">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-8 h-fit">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {user?.isEmailVerified ? "Email Verified" : "Verification Pending"}
            </span>
            <p className="text-xs text-slate-400 uppercase tracking-wide mt-2">Role: {user?.role}</p>
          </div>
        </div>

        <Card glass className="lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <UserRound className="w-4 h-4 text-blue-400" /> Full Name
              </label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" /> Email
              </label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" /> Phone
              </label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" isLoading={busy} onClick={() => void save()}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}