import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinuxMastery - The Complete Interactive Linux Engineering LMS",
  description:
    "Master Linux from absolute fundamentals to production site reliability engineering. Interactive in-browser Linux terminal sandbox, hands-on lab verification, comprehensive theory, and practical DevOps exercises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
