"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useInView,
} from "framer-motion";
import {
  User,
  Megaphone,
  Siren,
  Wrench,
  BarChart3,
  MapPin,
  Cross,
  Shield,
  ArrowRight,
  Sparkles,
  Activity,
  Radio,
  Radar,
  Zap,
  Globe2,
  Landmark,
  Users,
  CheckCircle2,
  Quote,
  Send,
  Satellite,
} from "lucide-react";
import { reportsApi, emergenciesApi } from "@/services/operations";
import { complaintsApi } from "@/services/complaints";

interface LiveStats {
  complaints: number;
  resolved: number;
  departments: number;
  officers: number;
  activeEmergencies: number;
}

function Reveal({
  children,
  delay = 0,
  y = 12,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());

  React.useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 1.8, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, value, mv]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

function HeroStat({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent: string;
}) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${accent}`}>{icon}</div>
      <div>
        <div className="text-xl font-black text-slate-900 leading-none">
          <CountUp value={value} />
        </div>
        <div className="text-[10px] font-semibold text-slate-500 tracking-wide mt-1 uppercase">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function SmartCityHomePage() {
  const [live, setLive] = React.useState<LiveStats>({
    complaints: 0,
    resolved: 0,
    departments: 0,
    officers: 0,
    activeEmergencies: 0,
  });
  const pulseLive = true;

  const refreshLiveStats = React.useCallback(async () => {
    try {
      const [overview, stats, emergencyStats] = await Promise.all([
        reportsApi.overview(),
        complaintsApi.stats(),
        emergenciesApi.stats(),
      ]);
      let activeEmergencies = 0;
      if (Array.isArray(emergencyStats)) {
        activeEmergencies = emergencyStats
          .filter((s) => s.status !== "RESOLVED")
          .reduce((sum, s) => sum + s.count, 0);
      } else if (emergencyStats && typeof emergencyStats === "object") {
        activeEmergencies = (emergencyStats as { active?: number }).active ?? 0;
      }
      setLive({
        complaints: overview.complaints ?? 0,
        resolved: stats.resolved ?? 0,
        departments: overview.departments ?? 0,
        officers: overview.officers ?? 0,
        activeEmergencies,
      });
    } catch {
      // eslint-disable-next-line no-empty
    }
  }, []);

  React.useEffect(() => {
    refreshLiveStats();
    const id = setInterval(() => {
      if (!document.hidden) refreshLiveStats();
    }, 60000);
    return () => clearInterval(id);
  }, [refreshLiveStats]);

  const marqueeServices = [
    "Utility Bill Payments",
    "Book Appointments",
    "Trade Licenses",
    "Smart Transit",
    "Emergency SOS",
    "Real-time GIS",
    "IoT Sensors",
    "Digital Hospital",
    "Waste Management",
    "Report an Issue",
  ];

  const pillars = [
    {
      title: "Citizen Services",
      description: "Permits, resources & digital identity — every public touchpoint in one place.",
      icon: User,
      href: "/citizen/dashboard",
      accent: "text-sky-600 bg-sky-500/10 border-sky-500/20",
      glow: "from-sky-500/20 to-blue-500/5",
    },
    {
      title: "Complaint Management",
      description: "Report, track and rate resolution in real time with full SLA transparency.",
      icon: Megaphone,
      href: "/citizen/complaints/new",
      accent: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      glow: "from-amber-500/20 to-orange-500/5",
    },
    {
      title: "Emergency Command",
      description: "Co-located dispatch hub that turns callbacks into live crisis response.",
      icon: Siren,
      href: "/department/emergency",
      accent: "text-red-600 bg-red-500/10 border-red-500/20",
      glow: "from-red-500/20 to-rose-500/5",
    },
    {
      title: "Asset Intelligence",
      description: "Every street light, pump & park — monitored, maintained and optimized.",
      icon: Wrench,
      href: "/department/assets",
      accent: "text-teal-600 bg-teal-500/10 border-teal-500/20",
      glow: "from-teal-500/20 to-emerald-500/5",
    },
    {
      title: "City Analytics",
      description: "Data that thinks ahead — KPIs, trends and predictions for smarter planning.",
      icon: BarChart3,
      href: "/admin/dashboard",
      accent: "text-violet-600 bg-violet-500/10 border-violet-500/20",
      glow: "from-violet-500/20 to-indigo-500/5",
    },
    {
      title: "GIS Monitoring",
      description: "A living map of the metropolis — every layer, marker and movement.",
      icon: MapPin,
      href: "/department/dashboard",
      accent: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      glow: "from-emerald-500/20 to-teal-500/5",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Report & Connect",
      description: "Citizens flag issues or request services in seconds — web or mobile.",
      icon: Send,
      accent: "from-sky-500 to-blue-600",
    },
    {
      step: "02",
      title: "AI Routes & Assigns",
      description: "Smart triage routes every case to the right department instantly.",
      icon: Satellite,
      accent: "from-violet-500 to-indigo-600",
    },
    {
      step: "03",
      title: "Resolve & Verify",
      description: "Field teams update progress live; citizens close the loop with feedback.",
      icon: CheckCircle2,
      accent: "from-teal-500 to-emerald-600",
    },
  ];

  const testimonials = [
    {
      quote:
        "Our complaint-to-resolution time dropped by half in the first quarter. The citizens actually noticed.",
      name: "Rania Qureshi",
      role: "Municipal Commissioner",
      city: "Metropolis",
      initials: "RQ",
      color: "from-sky-500 to-blue-600",
    },
    {
      quote:
        "One dashboard for every department. It finally feels like a city government that runs itself.",
      name: "Daniel Okafor",
      role: "Chief Digital Officer",
      city: "Riverport City",
      initials: "DO",
      color: "from-teal-500 to-emerald-600",
    },
    {
      quote:
        "The live emergency feed alone is worth it. We coordinate floods, fires and medical — all in real time.",
      name: "Sofia Marino",
      role: "Emergency Services Lead",
      city: "San Luciano",
      initials: "SM",
      color: "from-violet-500 to-indigo-600",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip">
      <div className="aurora-blob w-[28rem] h-[28rem] bg-sky-400/25 -top-24 -left-24" />
      <div className="aurora-blob w-[30rem] h-[30rem] bg-violet-400/20 top-32 -right-32 [animation-delay:-5s]" />
      <div className="aurora-blob w-96 h-96 bg-teal-300/25 bottom-10 left-1/4 [animation-delay:-9s]" />

      <main className="flex-1 relative">
        {/* ===================== HERO (light premium) ===================== */}
        <section id="metrics" className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-teal-50/40">
          <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_50% 0%,black_20%,transparent_70%)]" />
          <div className="aurora-blob w-[30rem] h-[30rem] bg-sky-300/25 -top-20 left-1/4" />
          <div className="aurora-blob w-[26rem] h-[26rem] bg-indigo-300/20 top-24 -right-20 [animation-delay:-6s]" />
          <div className="aurora-blob w-96 h-96 bg-teal-300/20 bottom-0 -left-16 [animation-delay:-3s]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-8">
                <Reveal>
                  <div className="inline-flex items-center gap-2.5 text-xs font-semibold text-sky-700 bg-white/80 backdrop-blur border border-sky-200 px-4 py-2 rounded-full shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                    </span>
                    Introducing City OS 2.0 — 41 cities joined this year
                  </div>
                </Reveal>

                <Reveal delay={0.06}>
                  <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-black text-slate-900 tracking-tight leading-[1.04]">
                    One City.
                    <br />
                    <span className="text-gradient-animated">Zero Friction.</span>
                    <span className="block mt-4 text-2xl sm:text-3xl font-extrabold text-slate-600">
                      Every service, department &amp; sensor — unified.
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={0.12}>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                    A living operating system for modern municipalities — connecting citizens,
                    agencies, and infrastructure in one beautiful, real-time command center.
                  </p>
                </Reveal>

                <Reveal delay={0.18}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <HeroStat icon={<Megaphone className="w-4 h-4 text-sky-600" />} value={live.complaints} label="Complaints" accent="bg-sky-100" />
                    <HeroStat icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} value={live.resolved} label="Resolved" accent="bg-emerald-100" />
                    <HeroStat icon={<Landmark className="w-4 h-4 text-violet-600" />} value={live.departments} label="Departments" accent="bg-violet-100" />
                    <HeroStat icon={<Users className="w-4 h-4 text-amber-600" />} value={live.officers} label="Officers" accent="bg-amber-100" />
                  </div>
                </Reveal>

                <Reveal delay={0.24}>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href="/citizen/dashboard"
                      className="px-8 py-3.5 rounded-xl smart-btn-teal btn-shine font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-500/25"
                    >
                      <span>Enter Citizen Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="px-8 py-3.5 rounded-xl smart-btn-navy btn-shine font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <span>Government Access</span>
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Radio className={`w-4 h-4 ${pulseLive ? "text-emerald-500" : "text-slate-400"}`} />
                      <span>99.99% uptime</span>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Right hero visual */}
              <Reveal delay={0.15} className="lg:col-span-6 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="tilt-parent"
                >
                  <div className="tilt-3d relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                    <div className="relative aspect-[16/11] bg-white">
                      <Image
                        src="/hero.jpg"
                        alt="Connected smart city skyline with transport, parks, hospitals, and digital services"
                        fill
                        priority
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 via-transparent to-white/20" />
                      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:16px_16px]" />

                      <div className="animate-scan absolute left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                      {/* Top badges */}
                      <div className="relative z-10 flex flex-wrap gap-2 justify-end p-4">
                        <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-800 flex items-center gap-1.5 shadow-sm">
                          <Cross className="w-3.5 h-3.5 text-red-500" /> Digital Hospital
                        </span>
                        <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-800 flex items-center gap-1.5 shadow-sm">
                          <Shield className="w-3.5 h-3.5 text-sky-600" /> 24/7 Response
                        </span>
                      </div>

                      {/* Live telemetry chips */}
                      <div className="relative z-10 grid grid-cols-2 gap-4 px-6 mt-10">
                        <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }} className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-lg">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span>Live Traffic Mesh</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <p className="text-sm font-bold text-teal-700">{live.complaints.toLocaleString()} active signals</p>
                        </motion.div>

                        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative bg-white/90 backdrop-blur border border-slate-200 rounded-xl p-3 shadow-lg">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span>IoT Water Sensors</span>
                            <span className="w-2 h-2 rounded-full bg-sky-500" />
                          </div>
                          <p className="text-sm font-bold text-sky-700">{live.departments.toLocaleString()} zones online</p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="animate-float absolute -bottom-5 -left-6 hidden sm:flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-200">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600">
                    <Radar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Spatial Sync</div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Aware &amp; live
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===================== MARQUEE TICKER ===================== */}
        <section className="py-5 border-y border-slate-200/80 bg-white/70 backdrop-blur-md">
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
            <div className="flex w-max animate-marquee gap-4 pr-4">
              {[marqueeServices, marqueeServices].map((set, setIndex) => (
                <ul key={setIndex} aria-hidden={setIndex === 1} className="flex shrink-0 items-center gap-4">
                  {set.map((name) => (
                    <li
                      key={`${setIndex}-${name}`}
                      className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 px-4 py-2 rounded-full whitespace-nowrap shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-teal-600" />
                      {name}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FEATURE BENTO ===================== */}
        <section id="services" className="relative overflow-x-clip max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
                <Globe2 className="w-3.5 h-3.5" /> The Ecosystem
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                One Operating System. <span className="text-gradient">Every City System.</span>
              </h2>
              <p className="text-slate-500 text-sm">
                Six pillars engineered to work as one — beautiful, transparent and impossible to ignore.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            {pillars.map((item, index) => {
              const Icon = item.icon;
              const span =
                index === 0
                  ? "md:col-span-4"
                  : index === 1
                    ? "md:col-span-2"
                    : index === 2
                      ? "md:col-span-2"
                      : index === 3
                        ? "md:col-span-2"
                        : index === 4
                          ? "md:col-span-2"
                          : "md:col-span-2";
              return (
                <Reveal key={item.title} delay={index * 0.05} className={span}>
                  <Link href={item.href} className="tilt-parent group block h-full">
                    <div className={`tilt-3d card-glow glass-card rounded-3xl p-6 h-full flex flex-col justify-between bg-gradient-to-br ${item.glow}`}>
                      <div>
                        <div className={`p-3 rounded-2xl w-fit mb-5 border group-hover:scale-110 group-hover:rotate-3 transition-transform ${item.accent}`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-teal-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="mt-5 flex items-center gap-2 text-sm font-bold text-teal-700 group-hover:translate-x-1.5 transition-transform">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
          <div className="aurora-blob w-96 h-96 bg-cyan-500/20 top-0 -left-20" />
          <div className="aurora-blob w-96 h-96 bg-fuchsia-500/20 bottom-0 -right-20 [animation-delay:-7s]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-teal-300 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5" /> How It Works
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  From report to resolution <span className="text-gradient-animated">in minutes.</span>
                </h2>
                <p className="text-sm text-slate-300">
                  A purpose-built loop that respects citizens&apos; time — and the people serving them.
                </p>
              </div>
            </Reveal>

            <div className="hidden md:block h-1 w-full flow-line rounded-full opacity-40 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <Reveal key={s.step} delay={idx * 0.1}>
                    <div className="group relative h-full overflow-hidden rounded-3xl bg-white/5 backdrop-blur border border-white/10 p-7 hover:bg-white/10 transition-colors">
                      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${s.accent} opacity-60`} />
                      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors" />
                      <div className="relative flex items-center justify-between mb-6">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${s.accent} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-5xl font-black text-white/15 group-hover:text-white/25 transition-colors">{s.step}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{s.description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== TESTIMONIALS ===================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
                <Quote className="w-3.5 h-3.5" /> Cities Are Talking
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Loved by the people <span className="text-gradient">who run cities.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <Reveal key={t.name} delay={idx * 0.08}>
                <div className="card-glow glass-card rounded-3xl p-7 h-full flex flex-col justify-between">
                  <div>
                    <Quote className="w-7 h-7 text-slate-200 mb-4" />
                    <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} text-white text-sm font-black grid place-items-center`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role} · {t.city}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===================== CTA BANNER ===================== */}
        <section id="portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-600 via-sky-600 to-indigo-700 px-8 py-16 sm:px-14 text-center shadow-2xl shadow-sky-600/30">
              <div className="aurora-blob w-72 h-72 bg-white/20 top-0 -left-16" />
              <div className="aurora-blob w-72 h-72 bg-fuchsia-400/30 bottom-0 -right-16 [animation-delay:-6s]" />
              <div className="relative space-y-5 max-w-3xl mx-auto">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Ready when you are
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  Your city deserves a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-pink-200">brain.</span>
                </h2>
                <p className="text-white/85 text-sm sm:text-base max-w-xl mx-auto">
                  Join the cities building the future. Deploy the Citizen, Department &amp; Command
                  portals in days — not years.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Link
                    href="/register"
                    className="px-8 py-3.5 rounded-xl btn-shine bg-white text-slate-900 font-bold text-sm hover:bg-slate-50 transition-colors shadow-xl flex items-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="px-8 py-3.5 rounded-xl border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    Book a Demo
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}