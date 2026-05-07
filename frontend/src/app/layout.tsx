import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProjectLens - AI-Powered Project Evaluation Platform",
  description: "An intelligent system that evaluates developer projects from an interviewer’s perspective.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-900 text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
