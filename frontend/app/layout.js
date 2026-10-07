// frontend/app/layout.js

import "./globals.css";
import { Inter } from "next/font/google";
import SiteShell from "@/components/public/SiteShell";

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
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}