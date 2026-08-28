// frontend/app/layout.js

import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { MobileBottomNav } from "@/components/public/MobileBottomNav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Fast-Ex - Exam Platform",
  description: "Fast and secure online exam platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <div className="site-shell">
          {/* =================================================
              HEADER
              ================================================= */}
          <header className="site-header container">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </span>

              <span>
                Fast<span className="text-primary">-Ex</span>
              </span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <nav
                aria-label="Primary navigation"
                className="flex items-center gap-1"
              >
                <Link href="/" className="desktop-nav-link">
                  Home
                </Link>

                <Link href="/about" className="desktop-nav-link">
                  About
                </Link>

                <Link href="/contact" className="desktop-nav-link">
                  Contact
                </Link>
              </nav>

              <Link href="/get-going" className="desktop-nav-cta">
                Launch your portal
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          {/* =================================================
              SINGLE MAIN
              ================================================= */}
          <main className="site-main">{children}</main>

          {/* =================================================
              MOBILE NAV
              ================================================= */}
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}