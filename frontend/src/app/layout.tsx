import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/components/providers/app-providers";
import { AiChatWidget } from "@/components/chat/ai-chat-widget";

export const metadata: Metadata = {
  title: "Enterprise Smart City Platform",
  description: "Unified IoT, Citizen Services & Department Operations Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-transparent text-slate-900 font-sans">
        <AppProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AiChatWidget />
        </AppProviders>
      </body>
    </html>
  );
}