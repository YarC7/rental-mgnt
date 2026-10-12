"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Settings, ReceiptText, Building2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHostel } from "@/context/HostelContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "@/lib/auth-client";
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
  const { data: session } = useSession();
  const { currentHostel, hostels } = useHostel();
  const { state, setOpenMobile } = useSidebar();

  // Trang đăng nhập tự render full-screen, không dùng shell
  if (pathname === "/sign-in") {
    return null;
  }
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
    setOpenMobile(false);
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
          <Building2 className="w-4 h-4" />
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
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.name} onClick={() => setOpenMobile(false)}>
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
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground text-xs font-semibold flex-shrink-0 uppercase">
            {(session?.user?.name || session?.user?.email || "QT").slice(0, 2)}
          </div>
          <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1">
            <p className="text-xs font-semibold text-sidebar-foreground leading-none truncate">
              {session?.user?.name || "Quản trị viên"}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 mt-1 truncate">
              {session?.user?.email || "ZenBoard"}
            </p>
          </div>
          <button
            onClick={() => signOut({
              fetchOptions: {
                onSuccess: () => router.push("/sign-in"),
              },
            })}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground shrink-0 p-1.5 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer"
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <ThemeToggle className="text-sidebar-foreground/70 hover:text-sidebar-foreground shrink-0" />
        </div>
      </SidebarFooter>
    </SidebarBase>
  );
}
