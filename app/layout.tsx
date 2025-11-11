import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Sans, DM_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";
import Footer from "@/components/footer";

import "@/styles/globals.css";

const tomatoGrotesk = localFont({
  src: "./fonts/TomatoGrotesk.woff2",
  variable: "--font-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Word Inventory",
  description: "Your personal language library",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${tomatoGrotesk.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <AuthProvider>
            <ThemeProvider>
              <Header />
              <main className="flex-1 bg-[#fbfbfb] dark:bg-[#000] text-foreground">
                {children}
              </main>
              <Footer />
              <Toaster richColors closeButton position="bottom-right" />
            </ThemeProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
