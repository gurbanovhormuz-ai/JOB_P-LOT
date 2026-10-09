import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobPilot AI — Your AI-Powered Job Assistant",
  description:
    "Upload your CV, find matching jobs, auto-apply with AI-generated cover letters, and ace interviews with our AI Mock Interview Simulator.",
  keywords: [
    "AI job assistant",
    "auto apply jobs",
    "mock interview",
    "CV parser",
    "job matching",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-mesh">
        <Toaster>
          {children}
        </Toaster>
      </body>
    </html>
  );
}
