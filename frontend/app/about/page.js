// frontend/app/about/page.js
"use client";

import { motion } from "framer-motion";
import { GraduationCap, Shield, Zap, Users, Award, Clock } from "lucide-react";

export default function About() {
  return (
    <div className="container py-8 md:py-16">
      {/* ============================================
          HEADER
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-intro mb-12 md:mb-16"
      >
        <p className="eyebrow">The Fast-Ex standard</p>
        <h1 className="text-4xl font-bold gradient-text md:text-5xl lg:text-6xl mt-3 mb-4">
          About Fast-Ex
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Empowering organizations to conduct secure and efficient online exams.
        </p>
      </motion.div>

      {/* ============================================
          MISSION SECTION
          ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card text-center mb-12 md:mb-16 p-8 md:p-12"
      >
        <p className="section-label justify-center">Our mission</p>
        <h2 className="mt-4 mb-4 text-3xl md:text-4xl font-semibold text-primary">
          Make testing feel human.
        </h2>
        <p className="mx-auto max-w-3xl text-base md:text-lg leading-relaxed text-slate-600">
          To provide a fast, secure, and beautiful exam platform that makes
          online testing accessible and efficient for organizations and students
          alike.
        </p>
      </motion.div>

      {/* ============================================
          FEATURES GRID
          ============================================ */}
      <div className="stagger-grid mb-12 md:mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center p-8"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-xl mb-3">Secure</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Exam codes and student verification ensure only authorized
            participants.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center p-8"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4d9]">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-xl mb-3">Fast</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Instant auto-grading and real-time results for immediate feedback.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card text-center p-8"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8eef9]">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-xl mb-3">SaaS Ready</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Each organization gets its own branded exam portal.
          </p>
        </motion.div>
      </div>

      {/* ============================================
          STATS SECTION
          ============================================ */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card text-center p-8"
        >
          <Award className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-4xl font-bold text-primary">100%</p>
          <p className="text-sm text-slate-600 mt-1">Secure Exams</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card text-center p-8"
        >
          <Clock className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-4xl font-bold text-primary">Instant</p>
          <p className="text-sm text-slate-600 mt-1">Auto-Grading</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card text-center p-8"
        >
          <GraduationCap className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-4xl font-bold text-primary">Any Scale</p>
          <p className="text-sm text-slate-600 mt-1">For Any Organization</p>
        </motion.div>
      </div>
    </div>
  );
}