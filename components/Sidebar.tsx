"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Settings, ReceiptText, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHostel } from "@/context/HostelContext";

export default function Sidebar() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { currentHostel, hostels } = useHostel();

  // Extract active hostel from URL pathname (e.g. "/A/rooms" -> "A")
  const segments = pathname.split("/");
  const activeHostelSegment = segments[1];
  const staticSegments = ["", "tenants", "invoices", "settings", "api"];
  const activeHostel = (activeHostelSegment && !staticSegments.includes(activeHostelSegment)) ? activeHostelSegment : currentHostel;

  const menuItems = [
    { name: "Tổng quan", href: "/", icon: Home },
    { name: "Quản lý phòng", href: `/${activeHostel}/rooms`, icon: Building2 },
    { name: "Người thuê", href: "/tenants", icon: Users },
    { name: "Hóa đơn", href: "/invoices", icon: ReceiptText },
    { name: "Cài đặt đơn giá", href: "/settings", icon: Settings },
  ];

  const handleSwitchHostel = (hostelId: string) => {
    // If the path contains a valid hostel segment, swap it out
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
    <aside className="w-64 border-r border-stone-200 bg-stone-50/50 flex flex-col h-screen sticky top-0 font-sans">
      {/* App Logo/Header */}
      <div className="h-16 flex items-center px-6 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-white flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold text-stone-900 leading-none text-sm tracking-wide">ZENBOARD</h1>
            <span className="text-[10px] text-stone-500 font-medium">Hệ thống quản lý</span>
          </div>
        </div>
      </div>

      {/* Hostel Switcher Button Group */}
      <div className="px-4 pt-4">
        <div className="flex bg-stone-200/60 p-1 rounded-lg border border-stone-200 gap-1">
          {hostels.map((h) => (
            <button
              key={h.id}
              onClick={() => handleSwitchHostel(h.id)}
              className={cn(
                "flex-1 text-center py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer",
                activeHostel === h.id
                  ? "bg-white text-stone-950 shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-100/80"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-stone-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Info */}
      <div className="p-4 border-t border-stone-200 bg-stone-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 text-xs font-semibold">
            QT
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-800 leading-none">Quản trị viên</p>
            <p className="text-[10px] text-stone-500 mt-1">Hệ thống ngoại tuyến</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
