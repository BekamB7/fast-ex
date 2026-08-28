"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  GraduationCap,
  Shield,
  Sparkles,
  Zap,
  Activity,
  Clock3,
} from "lucide-react";

export default function Home() {
  return (
    <div className="container">
      {/* HERO SECTION */}
      <section className="hero-section ">
        {/* HERO CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 flex flex-col justify-center"
        >
          {/* Eyebrow */}
          <div className="eyebrow mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0" />
            Exam delivery, refined
          </div>

          {/* Main heading */}
          <h1 className="hero-title">
            Make every exam feel{" "}
            <span className="gradient-text">effortless.</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Fast-Ex gives organizations a calmer way to create, deliver, and
            understand online exams, while students stay focused on the work.
          </p>

          {/* Actions */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/get-going" className="btn-primary">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link href="/about" className="btn-outline">
              Explore Fast-Ex
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Secure by design
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Instant results
            </span>
          </div>
        </motion.div>

        {/* LIVE EXAM OVERVIEW DASHBOARD */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.75,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="hero-dashboard "
        >
          {/* AMBIENT GLOW */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl  " />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

          {/* DASHBOARD CARD CONTAINER */}
          <div className="relative flex min-h-[460px] w-full flex-col justify-around overflow-hidden rounded-[1rem] border border-primary/20 bg-primary p-6 text-white shadow-[0_28px_80px_rgba(8,127,91,0.24)]  ">
            {/* DECORATIVE BACKGROUND */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.06] blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-black/[0.05] blur-2xl" />

                {/* CARD CONTENT HEADER */}
            <div className=" relative z-10 flex items-center justify-evenly gap-4 ">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Activity className="h-[18px] w-[18px] text-white/90" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                    Live exam
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Overview
                  </p>
                </div>
              </div>

              <div className="w-[80px] flex items-center justify-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/75">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Today
              </div>
            </div>

            {/* MAIN STAT */}
            <div className="relative z-10 my-6 px-2 sm:px-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-white/50">
                    Students in progress
                  </p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-1 text-4xl font-bold leading-none tracking-tight sm:text-5xl lg:text-6xl"
                  >
                    2,480
                  </motion.p>
                </div>

                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-foreground shadow-lg"
                >
                  <GraduationCap className="h-6 w-6" />
                </motion.div>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/60">
                    Completion rate
                  </span>
                  <span className="text-xs font-bold text-white">72%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "72%" }}
                    transition={{
                      duration: 1.1,
                      delay: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
              </div>
            </div>

            {/* METRICS FLEX CONTAINER */}
            <div className="relative z-10 flex flex-col gap-3 px-2 sm:flex-row sm:px-4">
              {/* Reliability Card */}
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.09] p-3.5 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Shield className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-[10px]">
                    Reliability
                  </span>
                </div>

                <div className="mt-2.5 flex flex-col items-center">
                  <p className="text-xl font-bold leading-none sm:text-2xl">
                    98.4%
                  </p>
                  <p className="mt-1 text-[10px] text-white/50 sm:text-[11px]">
                    Platform uptime
                  </p>
                </div>
              </div>

              {/* Speed Card */}
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.09] p-3.5 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Clock3 className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-[10px]">
                    Speed
                  </span>
                </div>

                <div className="mt-2.5 flex flex-col items-center">
                  <p className="text-xl font-bold leading-none sm:text-2xl">
                    14 sec
                  </p>
                  <p className="mt-1 text-[10px] text-white/50 sm:text-[11px]">
                    Average grading
                  </p>
                </div>
              </div>
            </div>

            {/* CARD FOOTER */}
            <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 px-2 pt-4 sm:px-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/40">
                Fast-Ex platform
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Live
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="features-heading">
          <div>
            <p className="section-label">Built for momentum</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Everything your exam day needs.
            </h2>
          </div>
          <p className="features-supporting-text">
            Simple for admins. Clear for students.
          </p>
        </div>

        <div className="stagger-grid grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="card">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Secure exams</h3>
            <p className="text-sm leading-6 text-slate-600">
              Protected with unique exam codes and student verification.
            </p>
          </div>

          <div className="card">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4d9] text-[#a66d09]">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Instant results</h3>
            <p className="text-sm leading-6 text-slate-600">
              Auto-grading with immediate feedback and detailed reports.
            </p>
          </div>

          <div className="card">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8eef9] text-[#3f64a0]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Your own portal</h3>
            <p className="text-sm leading-6 text-slate-600">
              Give every organization a polished, branded exam experience.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}