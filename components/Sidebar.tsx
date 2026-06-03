"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Settings, ReceiptText, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHostel } from "@/context/HostelContext";
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export default function Sidebar() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { currentHostel, hostels } = useHostel();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const segments = pathname.split("/");
  const activeHostelSegment = segments[1];
  const staticSegments = ["", "tenants", "invoices", "settings", "api"];
  const activeHostel = (activeHostelSegment && !staticSegments.includes(activeHostelSegment)) ? activeHostelSegment : (currentHostel || hostels[0]?.id || "");

  const menuItems = [
    { name: "Tổng quan", href: "/", icon: Home },
    { name: "Quản lý phòng", href: `/${activeHostel}/rooms`, icon: Building2 },
    { name: "Người thuê", href: "/tenants", icon: Users },
    { name: "Hóa đơn", href: "/invoices", icon: ReceiptText },
    { name: "Cài đặt đơn giá", href: "/settings", icon: Settings },
  ];

  const handleSwitchHostel = (hostelId: string) => {
    const segments = pathname.split("/");
    const activeHostelSegment = segments[1];
    if (activeHostelSegment && !staticSegments.includes(activeHostelSegment)) {
      segments[1] = hostelId;
      router.push(segments.join("/"));
    } else {
      router.push(`/${hostelId}/rooms`);
    }
  };

  return (
    <SidebarBase collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="font-semibold text-sidebar-foreground leading-none text-sm tracking-wide">ZENBOARD</h1>
            <span className="text-[10px] text-sidebar-foreground/50 font-medium">Hệ thống quản lý</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Nhà trọ</SidebarGroupLabel>
          <div className={cn("px-1 pb-2", isCollapsed && "hidden")}>
            <div className="flex bg-sidebar-accent/50 p-1 rounded-lg border border-sidebar-border gap-1">
              {hostels.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleSwitchHostel(h.id)}
                  className={cn(
                    "flex-1 text-center py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer",
                    activeHostel === h.id
                      ? "bg-sidebar text-sidebar-foreground shadow-sm"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  )}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Điều hướng</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className={cn("flex items-center gap-3 p-2", isCollapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground text-xs font-semibold flex-shrink-0">
            QT
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-semibold text-sidebar-foreground leading-none">Quản trị viên</p>
            <p className="text-[10px] text-sidebar-foreground/50 mt-1">Hệ thống ngoại tuyến</p>
          </div>
        </div>
      </SidebarFooter>
    </SidebarBase>
  );
}
