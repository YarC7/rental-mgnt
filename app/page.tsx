"use client";

import Link from "next/link";
import { Building2, Users, Settings, ReceiptText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHostel } from "@/context/HostelContext";

export default function Home() {
  const { currentHostel } = useHostel();

  const quickCards = [
    {
      title: "Quản lý Phòng",
      description: "Xem trạng thái phòng trống, đã thuê, thêm sửa xóa phòng.",
      icon: Building2,
      href: `/${currentHostel}/rooms`,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      cta: "Đến trang phòng",
    },
    {
      title: "Khách thuê trọ",
      description: "Quản lý danh sách khách thuê, hợp đồng, thông tin liên lạc.",
      icon: Users,
      href: `/${currentHostel}/tenants`,
      color: "bg-blue-50 text-blue-700 border-blue-100",
      cta: "Đến trang khách thuê",
    },
    {
      title: "Dịch vụ & Tiện ích",
      description: "Đơn giá tiền điện, nước, internet, dịch vụ dọn dẹp vệ sinh.",
      icon: Settings,
      href: `/${currentHostel}/settings`,
      color: "bg-amber-50 text-amber-700 border-amber-100",
      cta: "Thiết lập đơn giá",
    },
    {
      title: "Tính tiền & Hóa đơn",
      description: "Tự động tính tiền điện nước hàng tháng và lập hóa đơn.",
      icon: ReceiptText,
      href: `/${currentHostel}/invoices`,
      color: "bg-rose-50 text-rose-700 border-rose-100",
      cta: "Lập hóa đơn mới",
    },
  ];

  return (
    <div className="p-8 w-full 2xl:max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Chào mừng trở lại!</h2>
        <p className="text-stone-500 text-sm">
          Hệ thống quản lý nhà trọ tối giản giúp bạn kiểm soát dòng tiền, khách thuê và dịch vụ dễ dàng nhất.
        </p>
      </div>

      {/* Welcome Zen Card */}
      <Card className="bg-white border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-stone-900">Mô hình nhà trọ của bạn</h3>
            <p className="text-stone-500 text-sm max-w-xl">
              Hệ thống hiện tại đang hoạt động dưới chế độ lưu trữ trình duyệt (offline mock state), cho phép bạn trải nghiệm đầy đủ các tính năng mà không cần đăng nhập hay cài đặt cơ sở dữ liệu phức tạp.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href={`/${currentHostel}/rooms`}>
              <Button className="bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs py-2 px-4 rounded-lg">
                Xem nhanh phòng trọ
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Grid Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.href} className="bg-white border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-2.5 rounded-lg border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold text-stone-900">{card.title}</CardTitle>
                  <CardDescription className="text-xs text-stone-500">{card.title.toUpperCase()}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-stone-600 leading-relaxed">{card.description}</p>
                <div className="flex justify-end pt-2">
                  <Link href={card.href}>
                    <Button variant="ghost" size="sm" className="text-stone-700 hover:text-stone-950 font-medium text-xs gap-1.5 p-0">
                      {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
