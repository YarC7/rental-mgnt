"use client";

import Link from "next/link";
import { Building2, Users, Settings, ReceiptText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      color: "bg-success-bg text-success border-success-border",
      cta: "Đến trang phòng",
    },
    {
      title: "Khách thuê trọ",
      description: "Quản lý danh sách khách thuê, hợp đồng, thông tin liên lạc.",
      icon: Users,
      href: `/${currentHostel}/tenants`,
      color: "bg-info-bg text-info border-info-border",
      cta: "Đến trang khách thuê",
    },
    {
      title: "Dịch vụ & Tiện ích",
      description: "Đơn giá tiền điện, nước, internet, dịch vụ dọn dẹp vệ sinh.",
      icon: Settings,
      href: `/${currentHostel}/settings`,
      color: "bg-warning-bg text-warning border-warning-border",
      cta: "Thiết lập đơn giá",
    },
    {
      title: "Tính tiền & Hóa đơn",
      description: "Tự động tính tiền điện nước hàng tháng và lập hóa đơn.",
      icon: ReceiptText,
      href: `/${currentHostel}/invoices`,
      color: "bg-danger-bg text-danger border-danger-border",
      cta: "Lập hóa đơn mới",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full 2xl:max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Chào mừng trở lại!</h2>
        <p className="text-muted-foreground text-sm">
          Hệ thống quản lý nhà trọ giúp bạn kiểm soát dòng tiền, khách thuê và dịch vụ dễ dàng nhất.
        </p>
      </div>

      {/* Welcome Zen Card */}
      <Card>
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Mô hình nhà trọ của bạn</h3>
            <p className="text-muted-foreground text-sm max-w-xl">
              Dữ liệu nhà trọ được lưu tập trung và đồng bộ qua hệ thống. Chọn nhà trọ đang quản lý ở thanh bên trái, rồi bắt đầu từ phòng trọ, khách thuê hoặc hóa đơn.
            </p>
          </div>
          <Link href={`/${currentHostel}/rooms`} className="w-full md:w-auto">
            <Button size="sm" className="text-xs w-full md:w-auto">
              Xem nhanh phòng trọ
            </Button>
          </Link>
        </div>
      </Card>

      {/* Grid Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {quickCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.href} className="shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-2.5 rounded-lg border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                <div className="flex justify-end pt-2">
                  <Link href={card.href}>
                    <Button variant="ghost" size="sm" className="font-medium text-xs gap-1.5 p-0">
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
