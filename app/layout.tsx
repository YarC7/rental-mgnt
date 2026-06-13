import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
  themeColor: "#1c1917",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-stone-50 text-stone-900 font-sans">
        <Providers>
          <PWARegister />
          <HostelProvider>
            <TooltipProvider>
              <SidebarProvider>
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen bg-stone-50 overflow-auto">
                  <div className="h-12 flex items-center px-4 bg-white border-b border-stone-200 sticky top-0 z-40">
                    <SidebarTrigger />
                  </div>
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
