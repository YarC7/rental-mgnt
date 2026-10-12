"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Tổng quan";
  if (pathname.endsWith("/rooms")) return "Quản lý phòng";
  if (pathname.startsWith("/tenants")) return "Người thuê";
  if (pathname.startsWith("/invoices")) return "Hóa đơn";
  if (pathname.startsWith("/settings")) return "Cài đặt đơn giá";
  return "ZenBoard";
}

export default function TopBar() {
  const pathname = usePathname() || "";

  // Trang đăng nhập tự render full-screen, không dùng shell
  if (pathname === "/sign-in") {
    return null;
  }

  return (
    <div className="min-h-12 flex items-center gap-2 px-4 pt-[env(safe-area-inset-top)] bg-card border-b border-border sticky top-0 z-40 shrink-0">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 self-center" />
      <span className="text-sm font-medium text-muted-foreground truncate">
        {getPageTitle(pathname)}
      </span>
      <div className="flex-1" />
      <ThemeToggle />
    </div>
  );
}
