// frontend/app/layout.js

import "./globals.css";
import { Inter } from "next/font/google";
import SiteShell from "@/components/public/SiteShell";
import { Toaster } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/feedback";

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
        <ConfirmProvider>
          <Toaster>
            <SiteShell>{children}</SiteShell>
          </Toaster>
        </ConfirmProvider>
      </body>
    </html>
  );
}