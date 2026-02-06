import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Poppins,
  Montserrat,
  Roboto,
} from "next/font/google";
import "./globals.css";

import { LayoutWrapper } from "../components/layout/LayoutWrapper";

/* UI Fonts */
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/* Editor Fonts */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Sochamila - Custom Design Platform",
  description: "Create and customize products with our design editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${inter.variable}
          ${poppins.variable}
          ${montserrat.variable}
          ${roboto.variable}
          bg-gray-50 antialiased
        `}
      >
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
