import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmSerifDisplay = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OilSim — Crude Availability Simulator",
  description: "Model the probability of crude reaching your CDU gate across 2,000 stochastic Monte Carlo trials. Powered by OpenNetrikkan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body className="min-h-screen bg-[#f4f2fb] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
