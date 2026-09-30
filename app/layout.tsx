import type { Metadata } from "next";
import { Rubik, Unbounded } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const display = Unbounded({ subsets: ["cyrillic", "latin"], variable: "--font-display", weight: ["700", "900"] });
const body = Rubik({ subsets: ["cyrillic", "latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Dubby-Wubb — Монголын онлайн дуу оруулалтын тоглоом",
  description: "Дуу оруул. Дүрдээ ор. Хөгжилд.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={`${display.variable} ${body.variable}`}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
