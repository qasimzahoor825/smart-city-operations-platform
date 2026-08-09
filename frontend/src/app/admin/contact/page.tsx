"use client";

import React from "react";
import { Mail, Send, MapPin } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { PageContainer } from "@/components/shared/page-container";
import { notificationsApi } from "@/services/operations";
import { toast } from "sonner";

export default function AdminContactPage() {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await notificationsApi.send({
        title: subject,
        message,
        type: "SYSTEM",
        channel: "SYSTEM",
      });
      toast.success("Message dispatched to the Smart City operations team");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Could not send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer title="Contact & Support" description="Reach the platform operations team or send an in-app message to all administrators.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card glass className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>Dispatch a system notification to administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Incident report for week 12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue or request. The team will review and respond."
                  required
                  className="w-full min-h-32 rounded-xl bg-white border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={sending} leftIcon={<Send className="w-4 h-4" />}>
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-5 space-y-4">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" /> Operations Desk
              </CardTitle>
              <CardDescription>support@smartcity.gov</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Mon–Fri, 9:00–18:00. Team typically responds within one business day.
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" /> Command Center
              </CardTitle>
              <CardDescription>Civic Center, Main Plaza</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              Visit the Civic Center help desk for in-person assistance.
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}