"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Clock3,
  GraduationCap,
  Shield,
} from "lucide-react";

export default function BakiPage() {
  return (
    <div className="container">
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.75,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="hero-dashboard"
        >
          {/* AMBIENT GLOW */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

          {/* DASHBOARD CARD CONTAINER */}
          <div className="relative flex min-h-[460px] w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-primary/20 bg-primary p-6 text-white shadow-[0_28px_80px_rgba(8,127,91,0.24)] sm:p-8">
            {/* DECORATIVE BACKGROUND */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.06] blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-black/[0.05] blur-2xl" />

            {/* CARD CONTENT HEADER */}
            <div className="relative z-10 flex items-center justify-between gap-4">
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

              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/75">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Today
              </div>
            </div>

            {/* MAIN STAT */}
            <div className="relative z-10 my-6">
              <div className="flex items-end justify-between gap-4">
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

            {/* METRICS GRID */}
            <div className="relative z-10 grid grid-cols-2 gap-3">
              {/* Reliability */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.09] p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Shield className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-[10px]">
                    Reliability
                  </span>
                </div>
                <p className="mt-2.5 text-xl font-bold leading-none sm:text-2xl">
                  98.4%
                </p>
                <p className="mt-1 text-[10px] text-white/50 sm:text-[11px]">
                  Platform uptime
                </p>
              </div>

              {/* Speed */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.09] p-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Clock3 className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-[10px]">
                    Speed
                  </span>
                </div>
                <p className="mt-2.5 text-xl font-bold leading-none sm:text-2xl">
                  14 sec
                </p>
                <p className="mt-1 text-[10px] text-white/50 sm:text-[11px]">
                  Average grading
                </p>
              </div>
            </div>

            {/* CARD FOOTER */}
            <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">
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
    </div>
  );
}