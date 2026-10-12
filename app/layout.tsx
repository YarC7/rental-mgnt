import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HostelProvider } from "@/context/HostelContext";
import Providers from "./providers";
import PWARegister from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZenBoard - Quản lý Nhà trọ",
  description: "Hệ thống quản lý nhà trọ tối giản và hiệu quả",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZenBoard",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex font-sans">
        <Providers>
          <PWARegister />
          <HostelProvider>
            <TooltipProvider>
              <SidebarProvider>
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-dvh overflow-auto pb-[env(safe-area-inset-bottom)]">
                  <TopBar />
                  {children}
                </main>
              </SidebarProvider>
            </TooltipProvider>
          </HostelProvider>
        </Providers>
      </body>
    </html>
  );
}
